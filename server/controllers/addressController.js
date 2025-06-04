import Address  from '../models/Address.js';


//Add address: api/address/add
export const addAddress = async (req, res) => {
    try{
        const{address,userId}=req.body;
        await Address.create({...address,userId});
        res.status(201).json({ success: true, message: "Address added successfully" });

    }
    catch (error) {
        console.error("Error adding address:", error);
        res.status(500).json({ success: false, message: "Failed to add address" });
    }
}
// get address : api/address/get
export const getAddress = async (req, res) => {
    try {
        const { userId } = req.body;
        const addresses = await Address.find({ userId });
        res.status(200).json({ success: true, addresses });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).json({ success: false, message: "Failed to fetch addresses" });
    }
}

