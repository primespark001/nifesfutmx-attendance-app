import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Announce from '../models/Announce.js';
import { calculateUser } from '../middleware/usersMiddleware.js';

const userRoute = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(path.dirname(path.dirname(__dirname)), 'frontend');

// GET Pages
userRoute.get(`/:id/dashboard`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'user', 'dashboard.html'));
}); 
userRoute.get(`/:id/attendance`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'user', 'attendance.html'));
});
userRoute.get(`/:id/announcements`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'user', 'announcements.html'));
});
userRoute.get(`/:id/members`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'user', 'members.html'));
});
userRoute.get(`/:id/profile`, (req, res) => {
    res.sendFile(path.join(frontendPath, 'views', 'user', 'profile.html'));
});

// Get User
userRoute.get('/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const user = await User.findOne({ id: id });
        if(!user) return res.status(404).json({ message: 'User not found!'});
        res.status(200).json({ message: 'success', user: user });
    } catch (err){
        throw new Error(err);        
    }
});

// User Theme
userRoute.post('/:id/set-theme', async (req, res) => {
    try{
        const { id, theme } = req.body;
        const setTheme = await User.findOneAndUpdate({ id: id }, { theme: theme }, {new: true, runValidators: true});
        if(!setTheme) return res.status(404).json({ message: 'Error. Try again!'});
        res.status(200).json({ message: 'Theme set.' });
    } catch (err){
        throw new Error(err);        
    }
});

// Logout
userRoute.post('/:id/logout', async (req, res) => {
    try{
        const { id } = req.body;
        const user = await User.findOneAndUpdate({ id: id }, { isLoggedIn: false }, {new: true, runValidators: true});
        if(!user) return res.status(404).json({ message: 'Error. Try again!'});
        res.status(200).json({ message: 'Logged Out Successfully.' });
    } catch (err){
        throw new Error(err);        
    }
});

// Delete Account
userRoute.post('/:id/delete-acct', async (req, res) => {
    try{
        const { id } = req.body;
        const user = await User.findOneAndDelete({ id: id });
        if(!user) return res.status(404).json({ message: 'Error. Try again!'});
        res.status(200).json({ message: 'Account Deleted Successfully.' });
    } catch (err){
        throw new Error(err);        
    }
});


// OVERVIEW
// Today's Service
userRoute.get('/:id/todayservice', async (req, res) => {
    try{
        const todayDate = new Date().toLocaleDateString('en-NG', {
            weekday: 'short',
            day: '2-digit',
            month: 'short', 
            year: 'numeric'
        });
        const service = await Service.find({ date: todayDate });
        if(!service) return res.status(404).json({ service: null });
        res.status(200).json({ service: service });
    } catch (err){
        throw new Error(err);        
    }
});
// Annoucements
userRoute.get('/:id/announcements', async (req, res) => {
    try{
        const announcements = await Announce.find().sort({ createdAt: -1 });
        res.status(200).json({ announce: announcements });
    } catch (err){
        throw new Error(err);        
    }
});
// Today's Birthday
userRoute.get('/:id/birthday2day', async (req, res) => {
    try{
        const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
        const regex = new RegExp(`${todayDate}, \\d{4}$`);
        const users = await User.find({ dob: regex }).sort({ createdAt: -1 });
        res.status(200).json({ users: users });
    } catch (err){
        throw new Error(err);        
    }
});
// Upcoming Birthdays
userRoute.get('/:id/birthdayupcoming', async (req, res) => {
    try{
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const todayDate = new Date();
        const today = todayDate.getDate();
        const thisMonth = months[todayDate.getMonth()];

        let upcomingDates = [];
        for(let i = 1; i <= 7; i++){
            let nextDate = today + i;
            let nextMonth = thisMonth;
            // Handle month change
            const daysInMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
            if(nextDate > daysInMonth){
                nextDate = nextDate - daysInMonth;
                nextMonth = months[(todayDate.getMonth() + 1) % 12];
            }
            const dateStr = `${nextMonth} ${nextDate.toString().padStart(2, '0')}`;
            upcomingDates.push(dateStr);
        }

        const regexes = upcomingDates.map(date => new RegExp(`${date}, \\d{4}$`));
        const users = await User.find({ dob: { $in: regexes } }).sort({ dob: 1 });
        res.status(200).json({ users: users });
    } catch (err){
        throw new Error(err);        
    }
});

// All Services
userRoute.get('/:id/services', async (req, res) => {
    try{
        const services = await Service.find().sort({ createdAt: -1 });
        res.status(200).json({ services: services });
    } catch (err){
        throw new Error(err);        
    }
});
// One Service
userRoute.get('/:id/service', async (req, res) => {
    try{
        const servId = req.query.servId;
        const service = await Service.findOne({ id: servId });
        if(!service) return res.status(404).json({ message: 'Service not found!'});
        res.status(200).json({ service: service });
    } catch (err){
        throw new Error(err);        
    }
});
// Search Services
userRoute.get('/:id/services/:title', async (req, res) => {
    try{
        const title = req.params.title;
        const services = await Service.find({ title: { $regex: title, $options: 'i' } }).sort({ createdAt: -1 });
        res.status(200).json({ services: services });
    } catch (err){
        throw new Error(err);        
    }
});
// Mark Attendance
userRoute.post('/:id/mark-attendance', async (req, res) => {
    try{
        const { servId, userId } = req.body;
        // Put userId in Service Attendance Array
        const service = await Service.findOne({ id: servId });
        if(!service) return res.status(404).json({ message: 'Service not found!'});
        if(service.status !== 'active') return res.status(400).json({ message: 'This service is not ACTIVE! Refresh and try again later.'});
        if(service.attendance.includes(userId)) return res.status(400).json({ message: 'You have already marked attendance for this service!'});
        service.attendance.push(userId);
        const saveServ = await service.save();
        if(!saveServ) return res.status(404).json({ message: 'Error occured! Refresh and try again.'});

        // Put servId in User Attended Array
        const user = await User.findOne({ id: userId });
        if(!user) return res.status(404).json({ message: 'User not found!'});    
        if(user.attended.includes(servId)) return res.status(400).json({ message: 'You have already marked attendance for this service!'});
        user.attended.push(servId);            
        const saveUser = await user.save();
        if(!saveUser) return res.status(404).json({ message: 'Error occured! Refresh and try again.'});

        // Calculate the consistency
        calculateUser(userId);
        res.status(200).json({ message: 'Attendance marked successfully!' });
    } catch (err){
        throw new Error(err);        
    }
    
});

// One Announcement
userRoute.get('/:id/announcement', async (req, res) => {
    try{
        const announceId = req.query.announceId;
        const announce = await Announce.findOne({ id: announceId });
        if(!announce) return res.status(404).json({ message: 'Announcement not found!'});
        res.status(200).json({ announce: announce });
    } catch (err){
        throw new Error(err);        
    }
});
// Search Announcements
userRoute.get('/:id/announcements/:title', async (req, res) => {
    try{
        const title = req.params.title;
        const announces = await Announce.find({ title: { $regex: title, $options: 'i' } }).sort({ createdAt: -1 });
        res.status(200).json({ announces: announces });
    } catch (err){
        throw new Error(err);        
    }
});

// All Members
userRoute.get('/:id/members', async (req, res) => {
    try{
        const { ufamily, uunit, ufaculty } = req.query;
        const family = await User.find({ family: ufamily }).sort({ surname: 1, firstname: 1 });
        const unit = await User.find({ unit: uunit }).sort({ surname: 1, firstname: 1 });
        const faculty = await User.find({ faculty: ufaculty }).sort({ surname: 1, firstname: 1 });
        res.status(200).json({ familyMem: family, unitMem: unit, facultyMem: faculty });
    } catch (err){
        throw new Error(err);        
    }
});
//  Search Members
userRoute.get('/:id/members/:name', async (req, res) => {
    try{
        const name = req.params.name;
        const members = await User.find({ firstname: { $regex: name, $options: 'i' } }).sort({ surname: 1, firstname: 1 });
        res.status(200).json({ members: members });
    } catch (err){
        throw new Error(err);        
    }
});



// PROFILE PAGE
// Edit Profile
userRoute.post('/:id/edit-profile', async (req, res) => {
    try{
        const {id, surname, firstname, othername, phone, dob, faculty, dept} = req.body;
        const user = await User.findOne({ id: id });
        if(!user) return res.status(400).json({ message: "User not found!" });

        user.surname = surname;
        user.firstname = firstname;
        user.othername = othername;
        user.phone = phone;
        user.dob = dob;
        user.faculty = faculty;
        user.dept = dept;
        const save = await user.save();
        if(!save) return res.status(404).json({ message: 'Error! Changes not Saved.'});
        res.status(200).json({ message: 'Changes Saved.'});
    } catch (err){
        if(err) throw new Error(err);
        return res.status(500).json({err});
    }
});
// Change Password
userRoute.post('/:id/change-password', async (req, res) => {
    try {
        const {id, oldpswd, newpswd} = req.body;
        const user = await User.findOne({ id: id });
        if (!user) return res.status(404).json({message: `User not found!`});

        const isMatch = await bcrypt.compare(oldpswd, user.pswd);
        if(!isMatch) return res.status(404).json({message: `Invalid password!`});

        const salt = await bcrypt.genSalt(10);
        const hashpswd = await bcrypt.hash(newpswd, salt);
        user.pswd = hashpswd;
        const save = await user.save();
        if(save) return res.status(200).json({ message: 'Changes Saved.'});
    } catch (err) {
        if (err) throw new Error(err);
        return res.status(500).json({err});
    }
});


export default userRoute;   