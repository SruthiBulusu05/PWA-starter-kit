"use strict";

const DB_VERSION = 1;
const DB_NAME = "uniliverdb";

const openDB = () => {
    return new Promise((resolve, reject) => {
        // if (!window.indexedDB) {
        //     reject("IndexedDB not supported");
        // }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            reject("DB error: " + event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            if (!db.objectStoreNames.contains("cart")) {
                db.createObjectStore("cart", {keyPath: "id"});
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
    });
};

const openObjectStore = (db, name, transactionMode) => {
    return db.transaction(name, transactionMode).objectStore(name);
};

const addObject = (storeName, object) => {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            openObjectStore(db, storeName, "readwrite")
                .add(object)
                .onsuccess = resolve;
        }).then(() => {console.log("")}).catch(reason => reject(reason));
    });
};

const updateObject = (storeName, id, object) => {
    return new Promise((resolve, reject) => {
        openDB().then(db => {
            openObjectStore(db, storeName, "readwrite")
                .openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (!cursor && cursor === null) {
                    reject(`No object store found for '${storeName}'`)
                }else if(cursor.value.id === id) {
                    var count = cursor.value.count;
                    object.count = count + 1;
                    cursor.update(object).onsuccess = resolve;
                    cursor.continue();
                }
            }
        }).then(() => {console.log("Updated cache successfully")}).catch(reason => reject(reason));
    });
};

const getCartItems = () => {
    return new Promise(resolve => {
        openDB().then(db => {
            const store = openObjectStore(db, "cart", "readwrite");
            const cartItems = [];
            store.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cartItems.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(cartItems);
                }
            }
        }).then(() => {console.log("")}).catch(reason => reject(reason));
    });
};