const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

require('dotenv').config();
const CODE = process.env.JSON_KEY;

async function login(req, res) {
    try {
        res.render('user/login');
    } catch (error) {
        console.error(error);
    }
}

async function register(req, res) {
    try {
        res.render('user/register');
    } catch (error) {
        console.error(error);
    }
}

async function registerUserData (req, res) {
    try {
        const { name, phone, addr, place, password } = req.body;
        const addEmpData = await prisma.User.create({
            data: {
                name: name,
                phone: phone,
                address: addr,
                place: place,
                password: password
            }
        });

        console.log('User added');
        res.redirect('/user/login');
    } catch (error) {
        console.error(error);
    }
}

// handle emp login requests
async function userLoginProcess (req, res) {
    try {
        const { phone, password } = req.body;
        console.log(`${phone} ${password}`);
        
        const user = await prisma.User.findUnique({
            where: {
                phone: phone
            }
        });

        if (!user) {
            return res.status(404).json({ message: "User not found"});
        }

        let isPassVaild = false;

        if ((user.password) === password) {
            isPassVaild = true;
        }

        if (!isPassVaild) {
            return res.status(401).json({message: "Invaild password"})
        }

        const token = jwt.sign({ userId: user.id }, CODE, { expiresIn: '1h' });
        res.cookie("userToken", token, { httpOnly: true });


        res.redirect('/user/dashboard');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
}

async function userLogout (req, res) {  
    res.clearCookie('userToken');
    return res.redirect('/');
}

async function dashboard (req, res) {
    try {
        const userData = req.userOne;
        const pk = userData.userId;

        const users = await prisma.User.findUnique({
            where: { id: parseInt(pk) }
        });

        const bookCount = await prisma.Booking.count({
            where: { userId: pk }
        });   
        
        const reportCount = await prisma.Report.count({
            where: { userId: pk }
        }); 

        const bookCan = await prisma.Booking.count({
            where: {
                userId: pk,
                status: 'CANCELLED'
            }
        });

        res.render('user/dashboard', { data: users, bookCount, reportCount, bookCan });
    } catch (error) {
        console.error(error);
    }
}

async function bookList (req, res) {
    try {
        const userData = req.userOne;
        const pk = userData.userId;

        const users = await prisma.User.findUnique({
            where: { id: parseInt(pk) }
        });

        const bookingsUser = await prisma.Booking.findMany({
            where: { 
                userId: pk,
                status: 'PENDING' 
            },
            include: {
                user: true, 
                rating: true, 
                employee: true,
            },
            orderBy: {
                createdAt: 'desc', 
            }
        });

        res.render('user/bookingList', { data: users, bookingsUser });
    } catch (error) {
        console.error(error);
    }
}

async function bookingComplaint(req, res) {
    try {
        const userData = req.userOne;
        const pk = userData.userId;

        const bookingId = req.query.id;
        console.log(`Booking ID : ${bookingId}`);

        const users = await prisma.User.findUnique({
            where: { id: parseInt(pk) }
        });

        const bookingsEmp = await prisma.Booking.findUnique({
            where: { 
                bookingNo: bookingId,
            },
            include: {
                user: true, 
                rating: true, 
                employee: true,
            }
        });

        res.render('user/complaint', { data: users, bookingsEmp, });
    } catch (error) {
        console.error(error);
    }
}

async function bookingComplaintAdd(req, res) {
    try {
        const { bookingId, empId, userId, message } = req.body;
        const reports = await prisma.Report.create({
            data: {
                userId: parseInt(userId),
                employeeId: parseInt(empId),
                bookingId: parseInt(bookingId),
                description: message
            }
        });

        console.log('report is added');

        res.redirect('/user/reports');
    } catch (error) {
        console.error(error);
    }
}

async function reports(req, res) {
    try {
        const userData = req.userOne;
        const pk = userData.userId;

        const users = await prisma.User.findUnique({
            where: { id: parseInt(pk) }
        });

        const reports = await prisma.Report.findMany({
            where: { userId: pk },
            include: {
                employee: true,
                booking: true,
                user: true
            }
        });

        res.render('user/reports', { data: users, reports: reports,});
    } catch (error) {
        console.error(error);
        
    }
}

async function bookingCancel(req, res) {
    try {
        const bookId = parseInt(req.params.bookingID);
        const empId = parseInt(req.params.empId);

        const updatedBooking = await prisma.Booking.update({
            where: { id: bookId },
            data: {
                status: 'CANCELLED' // Updating the status to CANCELLED
            }
        });

        const updatedEmp = await prisma.Employee.update({
            where: { id: empId },
            data: {
                isAvailable: true 
            }
        });
        console.log('Booking is cancelled');

        res.redirect('/user/bookingCancelList');
    } catch (error) {
        console.error(error);
        
    }
}

async function bookingCancelList(req, res) {
    try {
        const userData = req.userOne;
        const pk = userData.userId;

        const users = await prisma.User.findUnique({
            where: { id: parseInt(pk) }
        });

        const bookingsEmp = await prisma.Booking.findMany({
            where: { 
                userId: pk,
                status: 'CANCELLED' 
            },
            include: {
                user: true, 
                rating: true, 
                employee: true,
            },
            orderBy: {
                createdAt: 'desc', 
            }
        });

        res.render('user/bookingCancelList', { data: users, bookingsEmp });
        
    } catch (error) {
        console.error(error);
    }
}

async function bookingCompleted(req, res) {
    try {
        const userData = req.userOne;
        const pk = userData.userId;

        const users = await prisma.User.findUnique({
            where: { id: parseInt(pk) }
        });

        const bookingsEmp = await prisma.Booking.findMany({
            where: { 
                userId: pk,
                status: 'COMPLETED' 
            },
            include: {
                user: true, 
                rating: true, 
                employee: true,
            },
            orderBy: {
                createdAt: 'desc', 
            }
        });

        res.render('user/bookingCompleted', { data: users, bookingsEmp });
        
    } catch (error) {
        console.error(error);
    }
}

async function updateRating (req, res) {
    try {
        const bookingId = parseInt(req.params.bookingId);
        const newRating = parseInt(req.params.rating);

        const user = parseInt(req.params.user);
        const emp = parseInt(req.params.emp);

        await prisma.Rating.upsert({
            where: { bookingId: bookingId },
            update: { score: newRating },
            create: {
                bookingId: bookingId,
                score: newRating,
                // Provide userId and employeeId if necessary
                userId: user,
                employeeId: emp
            }
        });

        res.status(200).json({ message: 'Rating updated successfully' });
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ message: 'Failed to update rating' });
    }
}


module.exports = {
    login, register, registerUserData, userLoginProcess, dashboard, userLogout,
    bookList, bookingComplaint, bookingComplaintAdd, reports, bookingCancel, 
    bookingCancelList, bookingCompleted, updateRating,

};