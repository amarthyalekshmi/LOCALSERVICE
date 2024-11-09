const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

require('dotenv').config();
const CODE = process.env.JSON_KEY;

async function adminLogin (req, res) {
    res.render('admin/login');
}

// handle admin login requests
async function adminLoginProcess (req, res) {
    try {
        const {username, password} = req.body;
        console.log(`${username} ${password}`);
        
        const admin = await prisma.Admin.findUnique({
            where: {
                username: username
            }
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found"});
        }

        let isPassVaild = false;

        if ((admin.pwd) === password) {
            isPassVaild = true;
        }

        if (!isPassVaild) {
            return res.status(401).json({message: "Invaild password"})
        }

        const token = jwt.sign({ adminId: admin.id }, CODE, { expiresIn: '1h' });

        res.cookie("adminToken", token, { httpOnly: true });

        res.redirect('/admin/index');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in' });
    }
}

async function adminLogout (req, res) {  
    res.clearCookie('adminToken');
    return res.redirect('/admin/login');
}

async function home(req, res) {
    try {
        const bookCount = await prisma.Booking.count();  
        const reportCount = await prisma.Report.count(); 
        const bookCan = await prisma.Booking.count();
        const user = await prisma.User.count();
        const employee = await prisma.Employee.count();

        res.render('admin/index', { bookCount, reportCount, bookCan, user, employee });
    } catch (error) {
        console.error(error);
    }
}

async function addCategory(req, res) {
    try {
        const category = await prisma.JobCategory.findMany({
            orderBy: {
                createdAt: 'desc',
            }
        });
        res.render('admin/addCategory', { data: category });
    } catch (error) {
        console.error(error);
    }
}

async function removeCategory(req, res) {
    const id = req.params.id;
    try {
        const category = await prisma.JobCategory.delete({
            where: {
                id: parseInt(id),
            }
        });
        console.log('category is removed');
        
        return res.redirect('/admin/addCategory');
    } catch (error) {
        console.error(error);
    }
}

async function categoryAdd(req, res) {
    const { category } = req.body;
    try {
        const addCategory = await prisma.JobCategory.create({
            data: {
                name: category
            }
        });

        console.log('Category added');
        res.redirect('/admin/addCategory');
        
    } catch (error) {
        console.error(error);
    }
}

async function empDetails(req, res) {
    try {
        const emp = await prisma.Employee.findMany({
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                expertise: true // Assuming 'jobCategory' is the relation name in your Prisma schema
            }
        });
        res.render('admin/empDetails', { data: emp });
    } catch (error) {
        console.error(error);
    }
}

async function userDetails(req, res) {
    try {
        const user = await prisma.User.findMany({
            orderBy: {
                createdAt: 'desc',
            }
        });
        res.render('admin/userDetails', { data: user });
    } catch (error) {
        console.error(error);
    }
}

async function removeEmp(req, res) {
    const id = req.params.id;
    try {
        const emp = await prisma.Employee.delete({
            where: {
                id: parseInt(id),
            }
        });
        console.log('Emp is removed');
        
        return res.redirect('/admin/empDetails');
    } catch (error) {
        console.error(error);
    }
}

async function removeUser(req, res) {
    const id = req.params.id;
    try {
        const user = await prisma.User.delete({
            where: {
                id: parseInt(id),
            }
        });
        console.log('User is removed');
        
        return res.redirect('/admin/userDetails');
    } catch (error) {
        console.error(error);
    }
}

async function login(req, res) {
    try {
        res.render('login')
    } catch (error) {
        console.error(error);
    }
}

// global page
async function reports(req, res) {
    try {
        const reports = await prisma.Report.findMany({
            include: {
                user: true,
                employee: true,
                booking: true
            }
        });

        res.render('admin/reports', { reports })
    } catch (error) {
        console.error(error);
    }
}

async function register(req, res) {
    try {
        res.render('register')
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    adminLogin, adminLogin, adminLoginProcess, home, adminLogout,
    addCategory, categoryAdd, removeCategory, empDetails, removeEmp,
    userDetails, removeUser,
    login, register, reports,
};