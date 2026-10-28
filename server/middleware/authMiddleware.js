const jwt = require('jsonwebtoken');
const { memoryDb, isMock, supabase } = require('../config/supabase');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_jwt_key_for_dev_environment'
      );

      if (isMock) {
        const user = memoryDb.users.find((u) => u._id === decoded.id);
        if (!user) {
          return res.status(401).json({ message: 'User not found for token' });
        }
        req.user = user;
        return next();
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        return res.status(401).json({ message: 'User not found for token' });
      }

      req.user = {
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        apartmentId: user.apartment_id,
      };
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
