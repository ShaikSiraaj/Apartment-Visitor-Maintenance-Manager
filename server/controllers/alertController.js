const { memoryDb, isMock, supabase } = require('../config/supabase');

const createAlert = async (req, res) => {
  try {
    const { title, description, raisedBy, role, apartmentId, urgency } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required for alert' });
    }

    if (isMock) {
      const aptObjId = typeof apartmentId === 'object' ? apartmentId?._id : apartmentId;
      const apt = memoryDb.apartments.find((a) => a._id === aptObjId);

      const newAlert = {
        _id: memoryDb.generateId(),
        title,
        description,
        raisedBy: raisedBy || (req.user ? req.user.name : 'Visitor / Public'),
        role: role || (req.user ? req.user.role : 'Visitor'),
        apartmentId: apt || (aptObjId ? { _id: aptObjId } : null),
        urgency: urgency || 'High',
        status: 'Active',
        createdAt: new Date().toISOString(),
      };
      memoryDb.alerts.unshift(newAlert);
      return res.status(201).json(newAlert);
    }

    const { data: created, error } = await supabase
      .from('alerts')
      .insert([
        {
          title,
          description,
          raised_by: raisedBy || (req.user ? req.user.name : 'Visitor / Public'),
          role: role || (req.user ? req.user.role : 'Visitor'),
          apartment_id: apartmentId || null,
          urgency: urgency || 'High',
          status: 'Active',
        },
      ])
      .select('*, apartments(*)')
      .single();

    if (error) throw error;

    res.status(201).json({
      _id: created.id,
      title: created.title,
      description: created.description,
      raisedBy: created.raised_by,
      role: created.role,
      urgency: created.urgency,
      status: created.status,
      createdAt: created.created_at,
      apartmentId: created.apartments
        ? { _id: created.apartments.id, flatNumber: created.apartments.flat_number }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAlerts = async (req, res) => {
  try {
    if (isMock) {
      return res.json(memoryDb.alerts);
    }

    const { data: alerts, error } = await supabase
      .from('alerts')
      .select('*, apartments(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = alerts.map((a) => ({
      _id: a.id,
      title: a.title,
      description: a.description,
      raisedBy: a.raised_by,
      role: a.role,
      urgency: a.urgency,
      status: a.status,
      createdAt: a.created_at,
      apartmentId: a.apartments
        ? { _id: a.apartments.id, flatNumber: a.apartments.flat_number }
        : null,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resolveAlert = async (req, res) => {
  try {
    if (isMock) {
      const alert = memoryDb.alerts.find((a) => a._id === req.params.id);
      if (!alert) return res.status(404).json({ message: 'Alert not found' });

      alert.status = 'Resolved';
      return res.json(alert);
    }

    const { data: updated, error } = await supabase
      .from('alerts')
      .update({ status: 'Resolved' })
      .eq('id', req.params.id)
      .select('*, apartments(*)')
      .single();

    if (error || !updated) return res.status(404).json({ message: 'Alert not found' });

    res.json({
      _id: updated.id,
      title: updated.title,
      description: updated.description,
      raisedBy: updated.raised_by,
      role: updated.role,
      urgency: updated.urgency,
      status: updated.status,
      createdAt: updated.created_at,
      apartmentId: updated.apartments
        ? { _id: updated.apartments.id, flatNumber: updated.apartments.flat_number }
        : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAlert,
  getAlerts,
  resolveAlert,
};
