import dotenv from 'dotenv';
dotenv.config();
import cors from "cors"
import express from 'express';
import { supabaseClient } from './db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple'
import cookieParser from "cookie-parser"



const app = express()
app.use(cors({
    origin: ["https://seat-booking-app-1-frontend.onrender.com",'http://localhost:3000',],// 'http://localhost:3000',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials:true
}))
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(cookieParser()) 

app.get("/hello",async(req,res)=>{
    return res.status(200).json({message:"Working"})
})
// User Sign up
app.post("/auth/signup",async(req,res) => {
    
    
    const {username,email,password} = req.body
    const hashedPassword = await bcrypt.hash(password,10)

    try {     
        const { data: existingUser, error: findError } = await supabaseClient
            .from('users')
            .select()
            .eq('username', username) 
            .or(`email.eq.${email}`); 

        if (findError) {
            return res.status(400).json({ error: "Error checking existing user" });
        }

        if (existingUser.length > 0) {
            return res.status(400).json({ error: "Username or Email already exists" });
        }
        const { data:newUserEntry, error } = await supabaseClient
        .from('users')
        .insert([
        { username,email,password :hashedPassword}
        ]).select()
        
        if(error){
            return res.status(400).json({error:error.message})
        }

        const jwtSecretKey = process.env.JWT_SECRET
        
        const accessToken = jwt.encode({
            userId:newUserEntry[0].id,
            username:newUserEntry[0].username,
            email:newUserEntry[0].email
        },jwtSecretKey)
        const options = {
            httpOnly:true,
            secure:true,
            maxAge: 3600000, 
        }
       
        return res
        .status(201)
        .cookie("accessToken",accessToken,options)
        .json({userId:newUserEntry.id,message:'Signup successful, you are logged in!'})
    } catch (error) {
        return res.status(400).json({error:"Error Creating User"})
        
    }
        
})

//User Login
app.post("/auth/login",async(req,res)=>{
    const {username,password} = req.body

    try {
        const {data,error} = await supabaseClient
        .from('users')
        .select('*')
        .eq('username',username)
        .single()
    
        if (error || !data){
            return res.status(400).json({error:"Invalid Credential"})
        }
    
        const isPasswordCorrect = await bcrypt.compare(password,data.password)
        if(!isPasswordCorrect){
            return res.status(400).json({error:"Invalid Credential"})
        }
        const jwtSecretKey = process.env.JWT_SECRET
        
        const accessToken = jwt.encode({userId:data.id},jwtSecretKey)
        const options = {
            httpOnly:true,
            secure:true,
            maxAge: 3600000, 
        }
        
        const {data:loginUser,error:loginUserError} = await supabaseClient
        .from('users')
        .select('username,email,id')
        .eq('username','testuser1')
        .single()

        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .json({userInfo:loginUser,accessToken})
    } catch (error) {
        res.status(400).json({error:`Error Logging In , ${error.message}`})   
    }



})

//Seats Availiblity
app.get('/seats',async(req,res)=>{
    try {
        const {data,error} = await supabaseClient
        .from('seats')
        .select('*')
    
        if(error){
            return res.status(400).json({error:error.message})
        }
        return res.status(200).json(data)
    } catch (error) {
        return res.status(400).json({error:"Error Fetching Seats Availiblity"})
    }
})

app.post('/seats/reserve', async (req, res) => {
    const { numberOfSeats } = req.body;
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    const jwtSecretKey = process.env.JWT_SECRET;
    
    try {
        const decoded = jwt.decode(accessToken, jwtSecretKey);
        if (!decoded?.userId) {
            return res.status(400).json({ error: 'Unauthorized access' });
        }

        // Fetch unreserved seats
        const { data: seats, error: seatsError } = await supabaseClient
            .from('seats')
            .select('id, row, seat_number')
            .eq('is_reserved', false);

        if (seatsError) {
            return res.status(400).json({ error: "Error fetching seats data." });
        }

        // Group seats by row
        const groupedSeats = seats.reduce((acc, seat) => {
            const row = seat.row;
            if (!acc[row]) {
                acc[row] = [];
            }
            acc[row].push(seat);
            return acc;
        }, {});

        let allocatedSeats = [];

        // Step 1: Check if any row has enough available seats
        for (const row in groupedSeats) {
            if (groupedSeats[row].length >= numberOfSeats) {
                allocatedSeats = groupedSeats[row].slice(0, numberOfSeats);
                await supabaseClient
                    .from('seats')
                    .update({ is_reserved: true, reserved_by: decoded.userId })
                    .in('id', allocatedSeats.map(seat => seat.id));
                break;
            }
        }

        // Step 2: If no single row has enough seats, try booking across rows
        if (allocatedSeats.length < numberOfSeats) {
            let availableSeats = [];
            for (const row in groupedSeats) {
                availableSeats.push(...groupedSeats[row]);
            }

            // Sort by seat number
            availableSeats.sort((a, b) => a.seat_number - b.seat_number);

            let nearbySeats = [];
            let seatCount = 0;

            // Try to find consecutive seats across rows
            for (let i = 0; i < availableSeats.length - 1; i++) {
                if (availableSeats[i + 1].seat_number === availableSeats[i].seat_number + 1) {
                    nearbySeats.push(availableSeats[i], availableSeats[i + 1]);
                    seatCount += 2;
                    i++; // Skip the next seat as it's already paired
                }

                if (seatCount >= numberOfSeats) break;
            }

            // Fill remaining seats if enough consecutive ones aren't found
            if (seatCount < numberOfSeats) {
                for (let i = seatCount; i < numberOfSeats; i++) {
                    nearbySeats.push(availableSeats[i]);
                }
            }

            if (nearbySeats.length < numberOfSeats) {
                return res.status(400).json({ error: 'Not enough adjacent seats available' });
            }

            allocatedSeats = nearbySeats;
        }

        // Reserve the seats and insert reservations into the database
        const seatIds = allocatedSeats.map(seat => seat.id);
        const reservationData = seatIds.map(id => ({
            user_id: decoded.userId,
            seat_id: id,
        }));

        const { error: reservationError } = await supabaseClient
            .from('reservations')
            .upsert(reservationData);  // Upsert to prevent duplicate reservations

        if (reservationError) {
            return res.status(400).json({ error: 'Error creating reservation entry.' });
        }

        // Mark the seats as reserved
        await supabaseClient
            .from('seats')
            .update({ is_reserved: true, reserved_by: decoded.userId })
            .in('id', seatIds);

        return res.status(200).json({
            message: 'Seats reserved successfully!',
            seats: allocatedSeats,
            userId: decoded.userId,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});