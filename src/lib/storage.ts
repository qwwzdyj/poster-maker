'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface PaperArchitectDB extends DBSchema {
    blueprints: {
        key: string;
        value: {
            id: string;
            title: string;
            content: string;
            createdAt: number;
            updatedAt: number;
        };
        indexes: { 'by-date': number };
    };
    compositions: {
        key: string;
        value: {
            id: string;
            blueprintId: string;
            content: string;
            createdAt: number;
            updatedAt: number;
        };
        indexes: { 'by-blueprint': string };
    };
    settings: {
        key: string;
        value: {
            apiKey: string;
            baseUrl: string;
            model: string;
        };
    };
}

let dbPromise: Promise<IDBPDatabase<PaperArchitectDB>> | null = null;

function getDB() {
    if (!dbPromise) {
        dbPromise = openDB<PaperArchitectDB>('paper-architect-db', 1, {
            upgrade(db) {
                const blueprintStore = db.createObjectStore('blueprints', { keyPath: 'id' });
                blueprintStore.createIndex('by-date', 'updatedAt');

                const compositionStore = db.createObjectStore('compositions', { keyPath: 'id' });
                compositionStore.createIndex('by-blueprint', 'blueprintId');

                db.createObjectStore('settings');
            },
        });
    }
    return dbPromise;
}

// Blueprint operations
export async function saveBlueprint(id: string, title: string, content: string) {
    const db = await getDB();
    const now = Date.now();
    const existing = await db.get('blueprints', id);

    await db.put('blueprints', {
        id,
        title,
        content,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    });
}

export async function getBlueprint(id: string) {
    const db = await getDB();
    return db.get('blueprints', id);
}

export async function getAllBlueprints() {
    const db = await getDB();
    return db.getAllFromIndex('blueprints', 'by-date');
}

export async function deleteBlueprint(id: string) {
    const db = await getDB();
    await db.delete('blueprints', id);
}

// Composition operations
export async function saveComposition(id: string, blueprintId: string, content: string) {
    const db = await getDB();
    const now = Date.now();
    const existing = await db.get('compositions', id);

    await db.put('compositions', {
        id,
        blueprintId,
        content,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    });
}

export async function getComposition(id: string) {
    const db = await getDB();
    return db.get('compositions', id);
}

export async function getCompositionsByBlueprint(blueprintId: string) {
    const db = await getDB();
    return db.getAllFromIndex('compositions', 'by-blueprint', blueprintId);
}

// Settings operations
export async function saveSettings(settings: { apiKey: string; baseUrl: string; model: string }) {
    const db = await getDB();
    await db.put('settings', settings, 'user-settings');
}

export async function getSettings() {
    const db = await getDB();
    return db.get('settings', 'user-settings');
}
