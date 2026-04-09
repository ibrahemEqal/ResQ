import { db } from "@/config/firebaseConfig";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where
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

export const getReportsByUser = async (userId: string): Promise<Report[]> => {
  try {
    const q = query(
      collection(db, REPORTS_COLLECTION),
      where("userId", "==", userId),
    );

    const querySnapshot = await getDocs(q);
    const reports: Report[] = [];

    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report);
    });

    return reports;
  } catch (error) {
    console.error("Error getting reports: ", error);
    return [];
  }
};

export const getReports = async (): Promise<Report[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, REPORTS_COLLECTION));
    const reports: Report[] = [];

    querySnapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as Report);
    });

    return reports;
  } catch (error) {
    console.error("Error getting reports: ", error);
    return [];
  }
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
