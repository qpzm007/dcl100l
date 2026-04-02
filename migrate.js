const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const firebaseConfig = {
  apiKey: "AIzaSyAkFBrT8Zibdtaw6iw6Qgp-nrF3wN2V7ek",
  authDomain: "dcl100l.firebaseapp.com",
  projectId: "dcl100l",
  storageBucket: "dcl100l.firebasestorage.app",
  messagingSenderId: "423636580318",
  appId: "1:423636580318:web:316191480f56aa407a0f4f",
  measurementId: "G-7M2LYNSKJX"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

async function migrate() {
    console.log('Migration started...');
    const dbPath = path.join(__dirname, 'db.json');
    if (!fs.existsSync(dbPath)) {
        console.error('db.json not found!');
        return;
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const imagesDir = path.join(__dirname, 'images');

    // Migrate Images
    console.log('Migrating images...');
    for (let asm of data.assemblies) {
        if (asm.imageUrl && asm.imageUrl.startsWith('/images/')) {
            const fileName = asm.imageUrl.replace('/images/', '');
            const filePath = path.join(imagesDir, fileName);

            if (fs.existsSync(filePath)) {
                try {
                    console.log(`Uploading ${fileName}...`);
                    const fileBuffer = fs.readFileSync(filePath);
                    const storageRef = ref(storage, `images/${asm.id}_${Date.now()}_${fileName}`);
                    await uploadBytes(storageRef, fileBuffer);
                    const url = await getDownloadURL(storageRef);
                    asm.imageUrl = url;
                    console.log(`Uploaded ${fileName} -> ${url}`);
                } catch (imgErr) {
                    console.warn(`Failed to upload ${fileName}: ${imgErr.message}`);
                    console.warn('Continuing with next item...');
                }
            } else {
                console.warn(`File not found: ${filePath}`);
            }
        }
    }

    // Migrate Data to Firestore
    try {
        console.log('Migrating data to Firestore...');
        await setDoc(doc(db, 'app', 'state'), data);
        console.log('Migration completed successfully!');
    } catch (fsErr) {
        console.error('Firestore migration failed:', fsErr.message);
        if (fsErr.message.includes('permission-denied')) {
            console.error('TIP: Make sure Firestore is in "Test Mode" or its rules allow writes.');
        }
    }
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
