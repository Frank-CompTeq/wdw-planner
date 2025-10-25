import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc,
    query,
    where 
  } from 'firebase/firestore';
  import { db } from '../config/firebase';
  import { DVCContract, DVCValidationResult } from '../types';
  
  // ============= DVC CONTRACTS =============
  
  export const getUserDVCContracts = async (userId: string): Promise<DVCContract[]> => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) return [];
  
    return (userDoc.data().dvc_contracts || []) as DVCContract[];
  };
  
  export const addDVCContract = async (
    userId: string, 
    contract: Omit<DVCContract, 'contract_id' | 'current_points_available'>
  ): Promise<string> => {
    const contractId = `${contract.home_resort}-${Date.now()}`;
    
    const newContract: DVCContract = {
      ...contract,
      contract_id: contractId,
      current_points_available: contract.annual_points + contract.banked_points - contract.borrowed_points
    };
  
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    const currentContracts = userDoc.data()?.dvc_contracts || [];
    
    await updateDoc(userRef, {
      dvc_contracts: [...currentContracts, newContract]
    });
  
    return contractId;
  };
  
  export const updateDVCContract = async (
    userId: string,
    contractId: string,
    updates: Partial<DVCContract>
  ): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    const contracts = (userDoc.data()?.dvc_contracts || []) as DVCContract[];
    
    const updatedContracts = contracts.map(contract => 
      contract.contract_id === contractId 
        ? { 
            ...contract, 
            ...updates,
            current_points_available: calculateAvailablePoints({
              ...contract,
              ...updates
            })
          }
        : contract
    );
  
    await updateDoc(userRef, {
      dvc_contracts: updatedContracts
    });
  };
  
  export const deleteDVCContract = async (userId: string, contractId: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    const contracts = (userDoc.data()?.dvc_contracts || []) as DVCContract[];
    
    const filteredContracts = contracts.filter(c => c.contract_id !== contractId);
  
    await updateDoc(userRef, {
      dvc_contracts: filteredContracts
    });
  };
  
  // ============= DVC CALCULATIONS =============
  
  export const calculateAvailablePoints = (contract: DVCContract): number => {
    return contract.annual_points + contract.banked_points - contract.borrowed_points;
  };
  
  export const validateBooking = (
    contract: DVCContract,
    pointsRequired: number,
    checkInDate: Date,
    resort: string
  ): DVCValidationResult => {
    const availablePoints = calculateAvailablePoints(contract);
    
    // Vérification points suffisants
    if (pointsRequired > availablePoints) {
      return {
        valid: false,
        message: `Insufficient points. Need ${pointsRequired}, have ${availablePoints}`,
        points_required: pointsRequired,
        points_available: availablePoints
      };
    }
  
    // Vérification fenêtre de réservation
    const today = new Date();
    const daysUntilCheckIn = Math.floor((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // 11 mois = ~330 jours
    const isWithin11Months = daysUntilCheckIn <= 330;
    // 7 mois = ~210 jours
    const isWithin7Months = daysUntilCheckIn <= 210;
  
    // Home resort: 11 mois
    if (resort === contract.home_resort && !isWithin11Months) {
      return {
        valid: false,
        message: `Booking window not open. Home resort opens 11 months (${330 - daysUntilCheckIn} days remaining)`,
        booking_window_opens: new Date(today.getTime() + ((daysUntilCheckIn - 330) * 24 * 60 * 60 * 1000))
      };
    }
  
    // Autre resort: 7 mois
    if (resort !== contract.home_resort && !isWithin7Months) {
      return {
        valid: false,
        message: `Booking window not open. Other resorts open 7 months (${210 - daysUntilCheckIn} days remaining)`,
        booking_window_opens: new Date(today.getTime() + ((daysUntilCheckIn - 210) * 24 * 60 * 60 * 1000))
      };
    }
  
    return {
      valid: true,
      message: 'Booking valid',
      points_required: pointsRequired,
      points_available: availablePoints
    };
  };
  
  // ============= POINTS TRACKING =============
  
  export const deductPoints = async (
    userId: string,
    contractId: string,
    pointsToDeduct: number
  ): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    const contracts = (userDoc.data()?.dvc_contracts || []) as DVCContract[];
    
    const updatedContracts = contracts.map(contract => {
      if (contract.contract_id !== contractId) return contract;
  
      // Logique de déduction: banked → annual → borrowed
      let remaining = pointsToDeduct;
      let newBanked = contract.banked_points;
      let newAnnual = contract.annual_points;
      let newBorrowed = contract.borrowed_points;
  
      // Utilise banked d'abord
      if (newBanked >= remaining) {
        newBanked -= remaining;
        remaining = 0;
      } else {
        remaining -= newBanked;
        newBanked = 0;
      }
  
      // Puis annual
      if (remaining > 0 && newAnnual >= remaining) {
        newAnnual -= remaining;
        remaining = 0;
      } else if (remaining > 0) {
        remaining -= newAnnual;
        newAnnual = 0;
      }
  
      // Enfin borrowed (augmente la dette)
      if (remaining > 0) {
        newBorrowed += remaining;
      }
  
      return {
        ...contract,
        banked_points: newBanked,
        annual_points: newAnnual,
        borrowed_points: newBorrowed,
        current_points_available: newAnnual + newBanked - newBorrowed
      };
    });
  
    await updateDoc(userRef, {
      dvc_contracts: updatedContracts
    });
  };