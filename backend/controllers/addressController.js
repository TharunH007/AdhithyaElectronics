const Address = require('../models/Address');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
const getAddresses = async (req, res) => {
    const addresses = await Address.find({ user: req.user._id });
    res.json(addresses);
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
const addAddress = async (req, res) => {
    const { name, address, city, postalCode, country, phone, isDefault } = req.body;

    if (isDefault) {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    const newAddress = new Address({
        user: req.user._id,
        name,
        address,
        city,
        postalCode,
        country,
        phone,
        isDefault: !!isDefault,
    });

    const createdAddress = await newAddress.save();
    res.status(201).json(createdAddress);
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
    const address = await Address.findById(req.params.id);

    if (address && address.user.toString() === req.user._id.toString()) {
        await address.deleteOne();
        res.json({ message: 'Address removed' });
    } else {
        res.status(404).json({ message: 'Address not found' });
    }
};

module.exports = {
    getAddresses,
    addAddress,
    deleteAddress,
};
