import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import ResetPass from '../models/ResetPass.js';
import { sendCode } from '../utils/email.js';

const authRoute = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(path.dirname(path.dirname(__dirname)), 'frontend', 'views');

// GET Requests
authRoute.get('/register', (req, res) => {
    res.sendFile(path.join(frontendPath, 'auth', 'regpage.html'));
}); 
authRoute.get('/login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'auth', 'logpage.html'));
});
authRoute.get('/admin-login', (req, res) => {
    res.sendFile(path.join(frontendPath, 'auth', 'adminlogpage.html'));
});
authRoute.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(frontendPath, 'auth', 'forgotpasspage.html'));
});

// POST Requests
authRoute.post('/register', async (req, res) => {
    try {
        const {surname, firstname, othername, phone, dob, family, unit, faculty, dept, email, pswd} = req.body;

        const existingUser = await User.findOne({ email });
        if(existingUser) return res.status(400).json({ message: "User with this email already exists!" });

        const uuid = uuidv4();
        const id = `${uuid.replace(/-/g, '')}`;
        const salt = await bcrypt.genSalt(10);
        const hashpswd = await bcrypt.hash(pswd, salt);

        const newUser = await User.create({
            id: id,
            surname,
            firstname,
            othername,
            phone,
            dob,
            family,
            unit,
            faculty,
            dept,
            email,
            pswd: hashpswd,
            isLoggedIn: true
        });
        res.status(201).json({ message: 'Registration Successful.', user: newUser });

        setTimeout(async ()=> {
            await User.findOneAndUpdate({ id: newUser.id }, { isLoggedIn: false }, {new: true, runValidators: true});            
        }, (1000 * 60 * 60 * 2));
    } catch (err) {
        if (err) throw new Error(err);
        return res.status(500).json({err});
    } 
});
authRoute.post('/login', async (req, res) => {
    try {
        const { logEmail, logPswd } = req.body;
        
        const existUser = await User.findOne({ email: logEmail }).select("+pswd");;
        if (!existUser) return res.status(404).json({message: `User not found! Email doesn't exist!`});

        const isMatch = await bcrypt.compare(logPswd, existUser.pswd);
        if(!isMatch) return res.status(404).json({message: `Invalid password!`});

        const user = await User.findOneAndUpdate({ id: existUser.id }, { isLoggedIn: true }, {new: true, runValidators: true});        
        
        res.status(200).json({ message: 'Login Successful.', user: user });
        
        clearTimeout();
        setTimeout(async ()=> {
            await User.findOneAndUpdate({ id: existUser.id }, { isLoggedIn: false }, {new: true, runValidators: true});            
        }, (1000 * 60 * 60 * 2));
    } catch (err) {
        if (err) throw new Error(err);
        return res.status(500).json({err});
    } 
});


authRoute.post('/admin-login', async (req, res) => {
    try {
        const { adUsername, adPswd } = req.body;

        const adminName = process.env.ADMIN_USERNAME;
        const pswd = process.env.ADMIN_PASSWORD;
        
        if(adUsername !== adminName) return res.status(404).json({message: `Admin not found! Username doesn't exist!`});
        if(adPswd !== pswd) return res.status(404).json({message: `Invalid password!`});

        const adminId = process.env.ADMIN_ID;

        const admin = await Admin.findOneAndUpdate({ admin_id: adminId }, { isLoggedIn: true }, { new: true, runValidators: true });
        
        clearTimeout();
        setTimeout(async ()=> {
            await Admin.findOneAndUpdate({ admin_id: adminId }, { isLoggedIn: false }, { new: true, runValidators: true });
        }, (1000 * 60 * 60 * 2));

        res.status(200).json({ message: 'Login Successful.', admin: admin });
    } catch (err) {
        if (err) throw new Error(err);
        return res.status(500).json({err});
    } 
});

authRoute.post('/forgot-password', async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({message: `User not found! Email doesn't exist!`});

        ResetPass.findOneAndDelete({ email: email });
        
        const uuid = uuidv4();
        const code = `${uuid.replace(/-/g, '').slice(0, 6)}`;
        console.log(code);
        
        const resetPass = await ResetPass.create({
            email: email,
            code: code
        });
        const success = await sendCode(resetPass);
        if(!success) return res.status(404).json({message: 'Error sending code. Try again later'});
        
        clearTimeout();
        setTimeout(async () => {
            await ResetPass.findOneAndDelete({ email: email });
        }, (1000 * 90));

        res.status(200).json({ message: 'Code sent. Check your email. Code expires in one minute'});
    } catch (err) {
        if (err) throw new Error(err);
        return res.status(500).json({err});
    } 
});

authRoute.post('/reset-password', async (req, res) => {
    try {
        const {email, code, pswd} = req.body;

        const user = await User.findOne({ email: email });
        if (!user) return res.status(404).json({message: `User not found! Email doesn't exist!`});

        const resetUserPass = await ResetPass.findOne({ email: email });
        if(!resetUserPass) return res.status(404).json({message: 'Code Expired'});

        if(code !== resetUserPass.code) return res.status(404).json({message: 'Invalid Code'});

        const salt = await bcrypt.genSalt(10);
        const hashpswd = await bcrypt.hash(pswd, salt);

        await User.findOneAndUpdate({ id: user.id }, { pswd: hashpswd }, { new: true, runValidators: true });
        await ResetPass.findOneAndDelete({ email: email });

        res.status(200).json({ message: 'Password Reset Successful. Please login!'});
    } catch (err) {
        if (err) throw new Error(err);
        return res.status(500).json({err});
    }
});

export default authRoute;