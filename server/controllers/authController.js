const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase, memoryDb, isMock } = require('../config/supabase');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_for_dev_environment',
    { expiresIn: '30d' }
  );
};

// @desc Register user
// @route POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, apartmentId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const lowerEmail = email.toLowerCase();

    if (isMock) {
      const existing = memoryDb.users.find((u) => u.email === lowerEmail);
      if (existing) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const newUser = {
        _id: memoryDb.generateId(),
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: role || 'Resident',
        apartmentId: apartmentId || null,
        createdAt: new Date().toISOString(),
      };
      memoryDb.users.push(newUser);

      return res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        apartmentId: newUser.apartmentId,
        token: generateToken(newUser._id),
      });
    }

    // Supabase table operations
    const { data: existingUsers } = await supabase
      .from('users')
      .select('*')
      .eq('email', lowerEmail);

    if (existingUsers && existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const { data: created, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          email: lowerEmail,
          password: hashedPassword,
          role: role || 'Resident',
          apartment_id: apartmentId || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      _id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      apartmentId: created.apartment_id,
      token: generateToken(created.id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Login user
// @route POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const lowerEmail = email.toLowerCase();

    if (isMock) {
      const user = memoryDb.users.find((u) => u.email === lowerEmail);
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          apartmentId: user.apartmentId,
          token: generateToken(user._id),
        });
      }
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Supabase lookup
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', lowerEmail);

    if (error || !users || users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    if (await bcrypt.compare(password, user.password)) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        apartmentId: user.apartment_id,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (isMock) {
      const user = memoryDb.users.find((u) => u._id === req.user._id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      const apt = memoryDb.apartments.find((a) => a._id === user.apartmentId);
      return res.json({
        ...user,
        apartmentId: apt || user.apartmentId,
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*, apartments(*)')
      .eq('id', req.user._id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      apartmentId: user.apartments
        ? { _id: user.apartments.id, flatNumber: user.apartments.flat_number, floor: user.apartments.floor }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
