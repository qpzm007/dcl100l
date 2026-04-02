const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');
// 이미지 폴더: 프로젝트 루트의 images/ (public/ 외부에 별도 분리)
const IMAGES_DIR = path.join(__dirname, 'images');

// 이미지 폴더 없으면 생성
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log('  📁 images/ 폴더 생성됨');
}

// 1.png: 루트 또는 public/images/ → images/ 로 복사
const srcImgRoot   = path.join(__dirname, '1.png');
const srcImgPublic = path.join(__dirname, 'public', 'images', '1.png');
const destImg      = path.join(IMAGES_DIR, '1.png');
if (!fs.existsSync(destImg)) {
    if (fs.existsSync(srcImgRoot))   fs.copyFileSync(srcImgRoot,   destImg);
    else if (fs.existsSync(srcImgPublic)) fs.copyFileSync(srcImgPublic, destImg);
}

// Multer 설정 (이미지 업로드)
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, IMAGES_DIR),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const asmId = req.params.id;
        cb(null, `asm_${asmId}${ext}`);
    }
});
const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('이미지 파일만 업로드 가능합니다.'));
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB 제한
});

// 미들웨어
app.use(cors());
app.use(express.json({ limit: '50mb' }));
// 정적 파일: public/ (HTML, CSS 등)
app.use(express.static(path.join(__dirname, 'public')));
// 이미지 폴더를 /images 경로로 별도 서빙
app.use('/images', express.static(IMAGES_DIR));

// --- DB 헬퍼 함수 ---
function readDB() {
    try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        return { assemblies: [], currentAsmId: null };
    }
}

function writeDB(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

// --- REST API ---

// [GET] 전체 데이터 조회
app.get('/api/data', (req, res) => {
    res.json(readDB());
});

// [PUT] currentAsmId 업데이트
app.put('/api/current', (req, res) => {
    const { currentAsmId } = req.body;
    const db = readDB();
    db.currentAsmId = currentAsmId;
    writeDB(db);
    res.json({ ok: true });
});

// [GET] 모든 조립체 조회
app.get('/api/assemblies', (req, res) => {
    const db = readDB();
    res.json(db.assemblies);
});

// [POST] 새 조립체 추가
app.post('/api/assemblies', (req, res) => {
    const db = readDB();
    const newAsm = req.body;
    if (!newAsm.id || !newAsm.name) {
        return res.status(400).json({ error: 'id와 name이 필요합니다.' });
    }
    db.assemblies.push(newAsm);
    db.currentAsmId = newAsm.id;
    writeDB(db);
    res.status(201).json(newAsm);
});

// [PUT] 조립체 전체 업데이트 (파트 목록 포함)
app.put('/api/assemblies/:id', (req, res) => {
    const db = readDB();
    const idx = db.assemblies.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: '조립체를 찾을 수 없습니다.' });
    db.assemblies[idx] = { ...db.assemblies[idx], ...req.body };
    writeDB(db);
    res.json(db.assemblies[idx]);
});

// [DELETE] 조립체 삭제
app.delete('/api/assemblies/:id', (req, res) => {
    const db = readDB();
    if (db.assemblies.length <= 1) {
        return res.status(400).json({ error: '최소 1개의 조립체는 존재해야 합니다.' });
    }
    db.assemblies = db.assemblies.filter(a => a.id !== req.params.id);
    if (db.currentAsmId === req.params.id) {
        db.currentAsmId = db.assemblies[0]?.id || null;
    }
    writeDB(db);
    res.json({ ok: true, currentAsmId: db.currentAsmId });
});

// [POST] 이미지 업로드 (multipart/form-data)
app.post('/api/assemblies/:id/image', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });
    const db = readDB();
    const idx = db.assemblies.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: '조립체를 찾을 수 없습니다.' });
    
    const imageUrl = `/images/${req.file.filename}`;
    db.assemblies[idx].imageUrl = imageUrl;
    writeDB(db);
    res.json({ imageUrl });
});

// 루트 요청 → index.html 서빙
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
    console.log('');
    console.log('  ✅ 스마트 재고 & 파트리스트 관리 서버 시작!');
    console.log(`  🌐 브라우저에서 열기: http://localhost:${PORT}`);
    console.log('  📁 데이터 파일: db.json');
    console.log('  🖼️  이미지 폴더: images/  (업로드 시 이 폴더에 저장됨)');
    console.log('');
});
