import SQLite from 'react-native-sqlite-storage';

export const db = SQLite.openDatabase({ name: 'VehicleDB.db', location: 'Documents' });

// Create table
export const initDB = () => {
    db.transaction(tx => {
        // Create vehicles table if not exists
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS vehicles (
                id INTEGER PRIMARY KEY,
                month TEXT,
                finance_name TEXT,
                finance_contact_person_name TEXT,
                finance_contact_number TEXT,
                manager TEXT,
                branch TEXT,
                agreement_number TEXT,
                app_id TEXT,
                customer_name TEXT,
                bucket TEXT,
                emi TEXT,
                principle_outstanding TEXT,
                total_outstanding TEXT,
                product TEXT,
                fild_fos TEXT,
                registration_number TEXT,
                chassis_number TEXT,
                engine_number TEXT,
                repo_fos TEXT,
                entry_date TEXT,
                type TEXT,
                last_reg_no TEXT,          -- ✅ New column
                last_chassis_no TEXT,      -- ✅ New column
                last_engine_no TEXT,
                state_code TEXT,
                vehicle_excel_upload_number Text
            );`,
            [],
            () => console.log("✅ Table created or already exists"),
            (error) => console.log("❌ Error creating table: ", error)
        );

        // 2️⃣ Check if customer_address column exists
        tx.executeSql(
            `PRAGMA table_info(vehicles);`,
            [],
            (tx, results) => {
                let exists = false;
                for (let i = 0; i < results.rows.length; i++) {
                    if (results.rows.item(i).name === 'customer_address') {
                        exists = true;
                        break;
                    }
                }
                // 3️⃣ Agar column nahi hai → ALTER TABLE add column
                if (!exists) {
                    tx.executeSql(
                        `ALTER TABLE vehicles ADD COLUMN customer_address TEXT;`,
                        [],
                        () => console.log("✅ customer_address column added"),
                        (err) => console.log("❌ Error adding customer_address column:", err.message)
                    );
                }
            }
        );


        // Create indexes to improve search performance
        // tx.executeSql(
        //     "CREATE INDEX IF NOT EXISTS idx_registration_number ON vehicles(registration_number);",
        //     [],
        //     () => console.log("✅ Index created on registration_number"),
        //     (error) => console.log("❌ Error creating index on registration_number: ", error)
        // );

        // tx.executeSql(
        //     "CREATE INDEX IF NOT EXISTS idx_chassis_no ON vehicles(chassis_no);",
        //     [],
        //     () => console.log("✅ Index created on chassis_no"),
        //     (error) => console.log("❌ Error creating index on chassis_no: ", error)
        // );

        // tx.executeSql(
        //     "CREATE INDEX IF NOT EXISTS idx_engine_no ON vehicles(engine_no);",
        //     [],
        //     () => console.log("✅ Index created on engine_no"),
        //     (error) => console.log("❌ Error creating index on engine_no: ", error)
        // );

        // ✅ New indexes for last_* columns
        tx.executeSql(
            "CREATE INDEX IF NOT EXISTS idx_reg_state ON vehicles(last_reg_no, state_code);",
            [],
            () => console.log("✅ Composite index created on last_reg_no + state_code"),
            (error) => console.log("❌ Error creating composite index on reg/state:", error)
        );

        tx.executeSql(
            "CREATE INDEX IF NOT EXISTS idx_chassis_state ON vehicles(last_chassis_no, state_code);",
            [],
            () => console.log("✅ Composite index created on last_chassis_no + state_code"),
            (error) => console.log("❌ Error creating composite index on chassis/state:", error)
        );

        tx.executeSql(
            "CREATE INDEX IF NOT EXISTS idx_engine_state ON vehicles(last_engine_no, state_code);",
            [],
            () => console.log("✅ Composite index created on last_engine_no + state_code"),
            (error) => console.log("❌ Error creating composite index on engine/state:", error)
        );

    });
};

export const bulkInsertVehicles = async (vehicles) => {
    const BATCH_SIZE = 32;
    const total = vehicles.length;
    const start = Date.now();

    try {
        // ✅ Step 1: Drop indexes before insert
        // await db.executeSql("DROP INDEX IF EXISTS idx_registration_number");
        // await db.executeSql("DROP INDEX IF EXISTS idx_chassis_no");
        // await db.executeSql("DROP INDEX IF EXISTS idx_engine_no");
        await db.executeSql("DROP INDEX IF EXISTS idx_last_reg_no");
        await db.executeSql("DROP INDEX IF EXISTS idx_last_chassis_no");
        await db.executeSql("DROP INDEX IF EXISTS idx_last_engine_no");
        await db.executeSql("DROP INDEX IF EXISTS idx_state_code");

        console.log("🔻 Indexes dropped");


        // ✅ Step 3: Insert in batches inside transaction
        await new Promise((resolve, reject) => {
            db.transaction(tx => {
                for (let i = 0; i < total; i += BATCH_SIZE) {
                    const batch = vehicles.slice(i, i + BATCH_SIZE);

                    const values = [];
                    const placeholders = batch.map(() =>
                        `(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                    ).join(',');

                    batch.forEach(v => {
                        values.push(
                            parseInt(v.id),
                            v.month,
                            v.finance_name,
                            v.finance_contact_person_name,
                            v.finance_contact_number,
                            v.manager,
                            v.branch,
                            v.agreement_number,
                            v.app_id,
                            v.customer_name,
                            v.bucket,
                            v.emi,
                            v.principle_outstanding,
                            v.total_outstanding,
                            v.product,
                            v.fild_fos,
                            v.registration_number,
                            v.chassis_number,
                            v.engine_number,
                            v.repo_fos,
                            v.entry_date,
                            v.type,
                            v.last_reg_no,       // ✅ new field
                            v.last_chassis_no,   // ✅ new field
                            v.last_engine_no,
                            v.state_code,
                            v.vehicle_excel_upload_number,
                            v.customer_address
                        );
                    });

                    const sql = `
                        INSERT OR REPLACE INTO vehicles (
                            id, month, finance_name, finance_contact_person_name,
                            finance_contact_number, manager, branch, agreement_number, app_id,
                            customer_name, bucket, emi, principle_outstanding,
                            total_outstanding, product, fild_fos, registration_number,
                            chassis_number, engine_number, repo_fos, entry_date, type,
                            last_reg_no, last_chassis_no, last_engine_no, state_code, vehicle_excel_upload_number, customer_address
                        ) VALUES ${placeholders}
                    `;

                    tx.executeSql(sql, values, null, (_, err) => {
                        console.log("❌ Insert error:", err.message);
                        return true;
                    });
                }
            },
                (err) => {
                    console.log("❌ Transaction error:", err.message);
                    reject(err);
                },
                () => {
                    resolve();
                });
        });

        // ✅ Step 4: Recreate indexes after insert
        // await db.executeSql("CREATE INDEX IF NOT EXISTS idx_registration_number ON vehicles(registration_number)");
        // await db.executeSql("CREATE INDEX IF NOT EXISTS idx_chassis_no ON vehicles(chassis_no)");
        // await db.executeSql("CREATE INDEX IF NOT EXISTS idx_engine_no ON vehicles(engine_no)");
        await db.executeSql("CREATE INDEX IF NOT EXISTS idx_reg_state ON vehicles(last_reg_no, state_code)");
        await db.executeSql("CREATE INDEX IF NOT EXISTS idx_chassis_state ON vehicles(last_chassis_no, state_code)");
        await db.executeSql("CREATE INDEX IF NOT EXISTS idx_engine_state ON vehicles(last_engine_no, state_code)");

        const end = Date.now();
        console.log(`✅ Inserted ${total} vehicles in ${(end - start) / 1000} seconds`);
    } catch (error) {
        console.log("❌ Bulk insert failed:", error.message);
        throw error;
    }
};

// Paginated fetch
export const getVehiclesPaginated = (offset, limit) => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM vehicles LIMIT ? OFFSET ?`,
                [limit, offset],
                (tx, results) => {
                    const rows = results.rows;
                    let data = [];
                    for (let i = 0; i < rows.length; i++) {
                        data.push(rows.item(i));
                    }
                    resolve(data);
                },
                (error) => {
                    console.log("❌ Error fetching vehicles:", error.message);
                    reject(error);
                }
            );
        });
    });
};

// db.js ke andar export karo
export const getAllVehicles = () => {
    return new Promise((resolve, reject) => {
        db.transaction(tx => {
            tx.executeSql(
                `SELECT * FROM vehicles`,
                [],
                (tx, results) => {
                    const rows = results.rows;
                    let vehicles = [];
                    for (let i = 0; i < rows.length; i++) {
                        vehicles.push(rows.item(i));
                    }
                    resolve(vehicles);
                },
                (error) => {
                    console.log("❌ Error fetching all vehicles:", error.message);
                    reject(error);
                }
            );
        });
    });
};

