const { memoryDb, isMock, supabase } = require('../config/supabase');

const createVisitor = async (req, res) => {
  try {
    const { name, phone, purpose, apartmentId, residentId } = req.body;

    if (!name || !phone || !purpose || !apartmentId) {
      return res.status(400).json({ message: 'Name, phone, purpose, and apartmentId are required' });
    }

    if (isMock) {
      const apt = memoryDb.apartments.find((a) => a._id === apartmentId);
      const resUser = memoryDb.users.find((u) => u._id === residentId);

      const newVisitor = {
        _id: memoryDb.generateId(),
        name,
        phone,
        purpose,
        apartmentId: apt || { _id: apartmentId, flatNumber: 'N/A' },
        residentId: resUser ? { _id: resUser._id, name: resUser.name, email: resUser.email } : null,
        entryTime: new Date().toISOString(),
        exitTime: null,
        status: 'Inside',
        createdAt: new Date().toISOString(),
      };
      memoryDb.visitors.unshift(newVisitor);
      return res.status(201).json(newVisitor);
    }

    const { data: created, error } = await supabase
      .from('visitors')
      .insert([
        {
          name,
          phone,
          purpose,
          apartment_id: apartmentId,
          resident_id: residentId || null,
          entry_time: new Date().toISOString(),
          status: 'Inside',
        },
      ])
      .select('*, apartments(*), users(*)')
      .single();

    if (error) throw error;

    res.status(201).json({
      _id: created.id,
      name: created.name,
      phone: created.phone,
      purpose: created.purpose,
      apartmentId: created.apartments
        ? { _id: created.apartments.id, flatNumber: created.apartments.flat_number }
        : created.apartment_id,
      residentId: created.users
        ? { _id: created.users.id, name: created.users.name, email: created.users.email }
        : null,
      entryTime: created.entry_time,
      exitTime: created.exit_time,
      status: created.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVisitors = async (req, res) => {
  try {
    if (isMock) {
      let results = [...memoryDb.visitors];
      if (req.user.role === 'Resident') {
        if (req.user.apartmentId) {
          const aptId = typeof req.user.apartmentId === 'object' ? req.user.apartmentId._id : req.user.apartmentId;
          results = results.filter((v) => {
            const vAptId = typeof v.apartmentId === 'object' ? v.apartmentId._id : v.apartmentId;
            return vAptId === aptId;
          });
        } else {
          return res.json([]);
        }
      }
      return res.json(results);
    }

    let query = supabase.from('visitors').select('*, apartments(*), users(*)');
    if (req.user.role === 'Resident' && req.user.apartmentId) {
      query = query.eq('apartment_id', req.user.apartmentId);
    }

    const { data: visitors, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const formatted = visitors.map((v) => ({
      _id: v.id,
      name: v.name,
      phone: v.phone,
      purpose: v.purpose,
      apartmentId: v.apartments
        ? { _id: v.apartments.id, flatNumber: v.apartments.flat_number }
        : null,
      residentId: v.users
        ? { _id: v.users.id, name: v.users.name, email: v.users.email }
        : null,
      entryTime: v.entry_time,
      exitTime: v.exit_time,
      status: v.status,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getVisitorById = async (req, res) => {
  try {
    if (isMock) {
      const visitor = memoryDb.visitors.find((v) => v._id === req.params.id);
      if (!visitor) return res.status(404).json({ message: 'Visitor record not found' });
      return res.json(visitor);
    }

    const { data: visitor, error } = await supabase
      .from('visitors')
      .select('*, apartments(*), users(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !visitor) return res.status(404).json({ message: 'Visitor record not found' });

    res.json({
      _id: visitor.id,
      name: visitor.name,
      phone: visitor.phone,
      purpose: visitor.purpose,
      apartmentId: visitor.apartments
        ? { _id: visitor.apartments.id, flatNumber: visitor.apartments.flat_number }
        : null,
      residentId: visitor.users
        ? { _id: visitor.users.id, name: visitor.users.name, email: visitor.users.email }
        : null,
      entryTime: visitor.entry_time,
      exitTime: visitor.exit_time,
      status: visitor.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const recordExit = async (req, res) => {
  try {
    if (isMock) {
      const visitor = memoryDb.visitors.find((v) => v._id === req.params.id);
      if (!visitor) return res.status(404).json({ message: 'Visitor record not found' });

      visitor.exitTime = new Date().toISOString();
      visitor.status = 'Exited';
      return res.json(visitor);
    }

    const { data: updated, error } = await supabase
      .from('visitors')
      .update({ exit_time: new Date().toISOString(), status: 'Exited' })
      .eq('id', req.params.id)
      .select('*, apartments(*), users(*)')
      .single();

    if (error || !updated) return res.status(404).json({ message: 'Visitor record not found' });

    res.json({
      _id: updated.id,
      name: updated.name,
      phone: updated.phone,
      purpose: updated.purpose,
      apartmentId: updated.apartments
        ? { _id: updated.apartments.id, flatNumber: updated.apartments.flat_number }
        : null,
      residentId: updated.users
        ? { _id: updated.users.id, name: updated.users.name, email: updated.users.email }
        : null,
      entryTime: updated.entry_time,
      exitTime: updated.exit_time,
      status: updated.status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteVisitor = async (req, res) => {
  try {
    if (isMock) {
      memoryDb.visitors = memoryDb.visitors.filter((v) => v._id !== req.params.id);
      return res.json({ message: 'Visitor record removed successfully' });
    }

    const { error } = await supabase.from('visitors').delete().eq('id', req.params.id);
    if (error) throw error;

    res.json({ message: 'Visitor record removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createVisitor,
  getVisitors,
  getVisitorById,
  recordExit,
  deleteVisitor,
};
