import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('emergency_tips.db');

export interface Tip {
    id: string;
    title: string;
    category: string;
    do_list: string; 
    dont_list: string;
}

export const initTipsDb = async (mockTips: any[]) => {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS tips (
            id TEXT PRIMARY KEY,
            title TEXT,
            category TEXT,
            do_list TEXT,
            dont_list TEXT
        );
    `);

    const count: any = await db.getFirstAsync('SELECT COUNT(*) as count FROM tips');

    if (count.count === 0) {
        for (const tip of mockTips) {
            await db.runAsync(
                'INSERT INTO tips (id, title, category, do_list, dont_list) VALUES (?, ?, ?, ?, ?)',
                [tip.id, tip.title, tip.category, JSON.stringify(tip.do), JSON.stringify(tip.dont)]
            );
        }
        console.log("✅ Tips initialized in SQLite");
    }
};

export const getTipsFromDb = async (): Promise<any[]> => {
    const rows = await db.getAllAsync('SELECT * FROM tips');
    return rows.map((row: any) => ({
        ...row,
        do: JSON.parse(row.do_list),
        dont: JSON.parse(row.dont_list)
    }));
};