const { memoryDb, isMock, supabase } = require('../config/supabase');

const createMaintenance = async (req, res) => {
  try {
    const { title, description, category, apartmentId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const aptId = apartmentId || req.user.apartmentId;

    if (!aptId) {
      return res.status(400).json({ message: 'Apartment ID is required for maintenance requests' });
    }

    const aptObjId = typeof aptId === 'object' ? aptId._id : aptId;

    if (isMock) {
      const apt = memoryDb.apartments.find((a) => a._id === aptObjId);
      const resUser = memoryDb.users.find((u) => u._id === req.user._id);

      const newRequest = {
        _id: memoryDb.generateId(),
        residentId: resUser ? { _id: resUser._id, name: resUser.name, email: resUser.email } : { _id: req.user._id, name: req.user.name },
        apartmentId: apt || { _id: aptObjId, flatNumber: 'N/A' },
        title,
        description,
        category: category || 'General',
        status: 'Pending',
        assignedTo: 'Unassigned',
        createdAt: new Date().toISOString(),
      };
      memoryDb.maintenance.unshift(newRequest);
      return res.status(201).json(newRequest);
    }

    const { data: created, error } = await supabase
      .from('maintenance')
      .insert([
        {
          resident_id: req.user._id,
          apartment_id: aptObjId,
          title,
          description,
          category: category || 'General',
          status: 'Pending',
          assigned_to: 'Unassigned',
        },
      ])
      .select('*, apartments(*), users(*)')
      .single();

    if (error) throw error;

    res.status(201).json({
      _id: created.id,
      title: created.title,
      description: created.description,
      category: created.category,
      status: created.status,
      assignedTo: created.assigned_to,
      createdAt: created.created_at,
      residentId: created.users
        ? { _id: created.users.id, name: created.users.name, email: created.users.email }
        : null,
      apartmentId: created.apartments
        ? { _id: created.apartments.id, flatNumber: created.apartments.flat_number }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMaintenanceRequests = async (req, res) => {
  try {
    if (isMock) {
      let results = [...memoryDb.maintenance];
      if (req.user.role === 'Resident') {
        results = results.filter((m) => {
          const rId = typeof m.residentId === 'object' ? m.residentId._id : m.residentId;
          return rId === req.user._id;
        });
      }
      return res.json(results);
    }

    let query = supabase.from('maintenance').select('*, apartments(*), users(*)');
    if (req.user.role === 'Resident') {
      query = query.eq('resident_id', req.user._id);
    }

    const { data: requests, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    const formatted = requests.map((m) => ({
      _id: m.id,
      title: m.title,
      description: m.description,
      category: m.category,
      status: m.status,
      assignedTo: m.assigned_to,
      createdAt: m.created_at,
      residentId: m.users
        ? { _id: m.users.id, name: m.users.name, email: m.users.email }
        : null,
      apartmentId: m.apartments
        ? { _id: m.apartments.id, flatNumber: m.apartments.flat_number }
        : null,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMaintenanceById = async (req, res) => {
  try {
    if (isMock) {
      const request = memoryDb.maintenance.find((m) => m._id === req.params.id);
      if (!request) return res.status(404).json({ message: 'Maintenance request not found' });
      return res.json(request);
    }

    const { data: request, error } = await supabase
      .from('maintenance')
      .select('*, apartments(*), users(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !request) return res.status(404).json({ message: 'Maintenance request not found' });

    res.json({
      _id: request.id,
      title: request.title,
      description: request.description,
      category: request.category,
      status: request.status,
      assignedTo: request.assigned_to,
      createdAt: request.created_at,
      residentId: request.users
        ? { _id: request.users.id, name: request.users.name, email: request.users.email }
        : null,
      apartmentId: request.apartments
        ? { _id: request.apartments.id, flatNumber: request.apartments.flat_number }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMaintenance = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    if (isMock) {
      const request = memoryDb.maintenance.find((m) => m._id === req.params.id);
      if (!request) return res.status(404).json({ message: 'Maintenance request not found' });

      if (status) request.status = status;
      if (assignedTo !== undefined) request.assignedTo = assignedTo;
      return res.json(request);
    }

    const updates = {};
    if (status) updates.status = status;
    if (assignedTo !== undefined) updates.assigned_to = assignedTo;

    const { data: updated, error } = await supabase
      .from('maintenance')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, apartments(*), users(*)')
      .single();

    if (error || !updated) return res.status(404).json({ message: 'Maintenance request not found' });

    res.json({
      _id: updated.id,
      title: updated.title,
      description: updated.description,
      category: updated.category,
      status: updated.status,
      assignedTo: updated.assigned_to,
      createdAt: updated.created_at,
      residentId: updated.users
        ? { _id: updated.users.id, name: updated.users.name, email: updated.users.email }
        : null,
      apartmentId: updated.apartments
        ? { _id: updated.apartments.id, flatNumber: updated.apartments.flat_number }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMaintenance = async (req, res) => {
  try {
    if (isMock) {
      memoryDb.maintenance = memoryDb.maintenance.filter((m) => m._id !== req.params.id);
      return res.json({ message: 'Maintenance request removed successfully' });
    }

    const { error } = await supabase.from('maintenance').delete().eq('id', req.params.id);
    if (error) throw error;

    res.json({ message: 'Maintenance request removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMaintenance,
  getMaintenanceRequests,
  getMaintenanceById,
  updateMaintenance,
  deleteMaintenance,
};
