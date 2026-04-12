import { db } from "@/config/firebaseConfig";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { Report } from "../types";

const REPORTS_COLLECTION = "reports";

export const submitReport = async (
  reportData: Omit<Report, "id" | "createdAt" | "status">,
) => {
  try {
    const newReport = {
      ...reportData,
      status: "Open",
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, REPORTS_COLLECTION), newReport);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding report: ", error);
    return { success: false, error };
  }
};

export const getReportsByUser = async (uid: string): Promise<Report[]> => {
  const q = query(collection(db, "reports"), where("userId", "==", uid));

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Report, "id">),
  }));
};

export const getReportById = async (id: string): Promise<Report | null> => {
  try {
    const docRef = doc(db, REPORTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Report;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting report details: ", error);
    return null;
  }
};
