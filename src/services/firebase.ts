import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export interface PathfinderSession {
  id?: string;
  userId: string;
  inquiry: string;
  evidenceDocs: { id: string; name: string; content: string }[];
  analysis: any | null;
  selectedPathwayId: string | null;
  dispatchedDirective: string | null;
  operatorSignature: string;
  updatedAt?: any;
}

export interface SubstrateDelta {
  id?: string;
  userId: string;
  timestamp?: any;
  observation: string;
  explanation: string;
  reasoning: string;
  learning: string;
  internalizedRule: string;
}

// Session Operations
export const saveSession = async (session: PathfinderSession): Promise<string> => {
  const { id, ...data } = session;
  const colRef = collection(db, "sessions");
  const dataToSave = {
    ...data,
    updatedAt: serverTimestamp()
  };

  if (id) {
    const docRef = doc(db, "sessions", id);
    await setDoc(docRef, dataToSave, { merge: true });
    return id;
  } else {
    const docRef = await addDoc(colRef, dataToSave);
    return docRef.id;
  }
};

export const getSessions = async (userId: string): Promise<PathfinderSession[]> => {
  try {
    const colRef = collection(db, "sessions");
    const q = query(colRef, where("userId", "==", userId), orderBy("updatedAt", "desc"));
    const snapshot = await getDocs(q);
    
    const sessions: PathfinderSession[] = [];
    snapshot.forEach((snapDoc) => {
      const data = snapDoc.data();
      sessions.push({
        id: snapDoc.id,
        userId: data.userId,
        inquiry: data.inquiry,
        evidenceDocs: data.evidenceDocs || [],
        analysis: data.analysis || null,
        selectedPathwayId: data.selectedPathwayId || null,
        dispatchedDirective: data.dispatchedDirective || null,
        operatorSignature: data.operatorSignature || "",
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : null
      });
    });
    return sessions;
  } catch (error) {
    console.error("Error retrieving sessions from Firestore:", error);
    // Return empty list on initial startup if firestore is still provisioning or indexes aren't fully ready
    return [];
  }
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  const docRef = doc(db, "sessions", sessionId);
  await deleteDoc(docRef);
};

// Substrate Delta Ledger Operations
export const saveSubstrateDelta = async (delta: SubstrateDelta): Promise<string> => {
  const colRef = collection(db, "substrate_deltas");
  const dataToSave = {
    ...delta,
    timestamp: serverTimestamp()
  };
  const docRef = await addDoc(colRef, dataToSave);
  return docRef.id;
};

export const getSubstrateDeltas = async (userId: string): Promise<SubstrateDelta[]> => {
  try {
    const colRef = collection(db, "substrate_deltas");
    const q = query(colRef, where("userId", "==", userId), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    
    const deltas: SubstrateDelta[] = [];
    snapshot.forEach((snapDoc) => {
      const data = snapDoc.data();
      deltas.push({
        id: snapDoc.id,
        userId: data.userId,
        timestamp: data.timestamp ? (data.timestamp as Timestamp).toDate() : null,
        observation: data.observation || "",
        explanation: data.explanation || "",
        reasoning: data.reasoning || "",
        learning: data.learning || "",
        internalizedRule: data.internalizedRule || ""
      });
    });
    return deltas;
  } catch (error) {
    console.error("Error retrieving substrate deltas from Firestore:", error);
    return [];
  }
};

export const deleteSubstrateDelta = async (deltaId: string): Promise<void> => {
  const docRef = doc(db, "substrate_deltas", deltaId);
  await deleteDoc(docRef);
};
