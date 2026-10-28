const { memoryDb, isMock, supabase } = require('../config/supabase');

const getApartments = async (req, res) => {
  try {
    if (isMock) {
      const apartments = memoryDb.apartments.map((a) => {
        const residents = memoryDb.users.filter((u) => u.apartmentId === a._id);
        return {
          ...a,
          residentIds: residents.map((r) => ({ _id: r._id, name: r.name, email: r.email, role: r.role })),
        };
      });
      return res.json(apartments);
    }

    const { data: apartments, error } = await supabase.from('apartments').select('*');
    if (error) throw error;

    const formatted = apartments.map((a) => ({
      _id: a.id,
      flatNumber: a.flat_number,
      floor: a.floor,
      residentIds: [],
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createApartment = async (req, res) => {
  try {
    const { flatNumber, floor, residentIds } = req.body;

    if (!flatNumber || floor === undefined) {
      return res.status(400).json({ message: 'Flat number and floor are required' });
    }

    if (isMock) {
      const existing = memoryDb.apartments.find((a) => a.flatNumber === flatNumber);
      if (existing) {
        return res.status(400).json({ message: 'Apartment/Flat number already exists' });
      }

      const newApt = {
        _id: memoryDb.generateId(),
        flatNumber,
        floor,
        residentIds: residentIds || [],
      };
      memoryDb.apartments.push(newApt);
      return res.status(201).json(newApt);
    }

    const { data: created, error } = await supabase
      .from('apartments')
      .insert([{ flat_number: flatNumber, floor }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      _id: created.id,
      flatNumber: created.flat_number,
      floor: created.floor,
      residentIds: [],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getApartments,
  createApartment,
};
