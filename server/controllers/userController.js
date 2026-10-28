const { memoryDb, isMock, supabase } = require('../config/supabase');

const getUsers = async (req, res) => {
  try {
    if (isMock) {
      const users = memoryDb.users.map((u) => {
        const apt = memoryDb.apartments.find((a) => a._id === u.apartmentId);
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          apartmentId: apt || u.apartmentId,
        };
      });
      return res.json(users);
    }

    const { data: users, error } = await supabase.from('users').select('*, apartments(*)');
    if (error) throw error;

    const formatted = users.map((u) => ({
      _id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      apartmentId: u.apartments
        ? { _id: u.apartments.id, flatNumber: u.apartments.flat_number }
        : null,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, email, role, apartmentId } = req.body;

    if (isMock) {
      const user = memoryDb.users.find((u) => u._id === req.params.id);
      if (!user) return res.status(404).json({ message: 'User not found' });

      if (name) user.name = name;
      if (email) user.email = email.toLowerCase();
      if (role) user.role = role;
      if (apartmentId !== undefined) user.apartmentId = apartmentId;

      return res.json(user);
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (role) updates.role = role;
    if (apartmentId !== undefined) updates.apartment_id = apartmentId;

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, apartments(*)')
      .single();

    if (error || !updated) return res.status(404).json({ message: 'User not found' });

    res.json({
      _id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      apartmentId: updated.apartments
        ? { _id: updated.apartments.id, flatNumber: updated.apartments.flat_number }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  updateUser,
};
