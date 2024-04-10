// Import necessary libraries
import { v4 as uuidv4 } from "uuid";
import { Server, StableBTreeMap, ic } from "azle";
import express from "express";

// Define the Doctor class to represent doctors
class Doctor {
  id: string;
  name: string;
  specialty: string;
  createdAt: Date;
}

// Define the Patient class to represent patients
class Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  createdAt: Date;
}

// Define the Appointment class to represent appointments
class Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: Date;
  duration: number;
  description: string;
  createdAt: Date;
  updatedAt: Date | null;
}

// Define the PatientRecord class to represent patient records
class PatientRecord {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  createdAt: Date;
}

// Define the Medication class to represent medications
class Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  patientId: string;
  createdAt: Date;
}

// Initialize stable maps for storing doctors and patients
const doctorsStorage = StableBTreeMap<string, Doctor>(0);
const patientsStorage = StableBTreeMap<string, Patient>(1);

// Initialize a stable map for storing appointments
const appointmentsStorage = StableBTreeMap<string, Appointment>(2);

// Initialize a stable map for storing patient records
const patientRecordsStorage = StableBTreeMap<string, PatientRecord>(3);

// Initialize a stable map for storing medications
const medicationsStorage = StableBTreeMap<string, Medication>(4);

// Define the express server
export default Server(() => {
  const app = express();
  app.use(express.json());

  // Endpoint for creating a new doctor
  app.post("/doctors", (req, res) => {
    const doctor: Doctor = {
      id: uuidv4(),
      createdAt: getCurrentDate(),
      ...req.body,
    };
    doctorsStorage.insert(doctor.id, doctor);
    res.json(doctor);
  });

  // Endpoint for retrieving all doctors
  app.get("/doctors", (req, res) => {
    res.json(doctorsStorage.values());
  });

  // Endpoint for creating a new patient
  app.post("/patients", (req, res) => {
    const patient: Patient = {
      id: uuidv4(),
      createdAt: getCurrentDate(),
      ...req.body,
    };
    patientsStorage.insert(patient.id, patient);
    res.json(patient);
  });

  // Endpoint for retrieving all patients
  app.get("/patients", (req, res) => {
    res.json(patientsStorage.values());
  });

  // Endpoint for creating a new appointment
  app.post("/appointments", (req, res) => {
    const appointment: Appointment = {
      id: uuidv4(),
      createdAt: getCurrentDate(),
      ...req.body,
    };
    appointmentsStorage.insert(appointment.id, appointment);
    res.json(appointment);
  });

  // Endpoint for retrieving all appointments
  app.get("/appointments", (req, res) => {
    res.json(appointmentsStorage.values());
  });

  // Endpoint for retrieving a specific appointment by ID
  app.get("/appointments/:id", (req, res) => {
    const appointmentId = req.params.id;
    const appointmentOpt = appointmentsStorage.get(appointmentId);
    if ("None" in appointmentOpt) {
      res
        .status(404)
        .send(`the appointment with id=${appointmentId} not found`);
    } else {
      res.json(appointmentOpt.Some);
    }
  });

  // Endpoint for updating an appointment
  app.put("/appointments/:id", (req, res) => {
    const appointmentId = req.params.id;
    const appointmentOpt = appointmentsStorage.get(appointmentId);
    if ("None" in appointmentOpt) {
      res
        .status(400)
        .send(
          `couldn't update an appointment with id=${appointmentId}. appointment not found`
        );
    } else {
      const appointment = appointmentOpt.Some;
      const updatedAppointment = {
        ...appointment,
        ...req.body,
        updatedAt: getCurrentDate(),
      };
      appointmentsStorage.insert(appointment.id, updatedAppointment);
      res.json(updatedAppointment);
    }
  });

  // Endpoint for deleting an appointment
  app.delete("/appointments/:id", (req, res) => {
    const appointmentId = req.params.id;
    const deletedAppointment = appointmentsStorage.remove(appointmentId);
    if ("None" in deletedAppointment) {
      res
        .status(400)
        .send(
          `couldn't delete an appointment with id=${appointmentId}. appointment not found`
        );
    } else {
      res.json(deletedAppointment.Some);
    }
  });

  // Endpoint for creating a new patient record
  app.post("/patient-records", (req, res) => {
    const patientRecord: PatientRecord = {
      id: uuidv4(),
      createdAt: getCurrentDate(),
      ...req.body,
    };
    patientRecordsStorage.insert(patientRecord.id, patientRecord);
    res.json(patientRecord);
  });

  // Endpoint for retrieving all patient records
  app.get("/patient-records", (req, res) => {
    res.json(patientRecordsStorage.values());
  });

  // Endpoint for retrieving patient records for a specific patient
  app.get("/patient-records/patient/:id", (req, res) => {
    const patientId = req.params.id;
    const patientRecords = patientRecordsStorage
      .values()
      .filter((record) => record.patientId === patientId);
    res.json(patientRecords);
  });

  // Endpoint for retrieving patient records for a specific doctor
  app.get("/patient-records/doctor/:id", (req, res) => {
    const doctorId = req.params.id;
    const patientRecords = patientRecordsStorage
      .values()
      .filter((record) => record.doctorId === doctorId);
    res.json(patientRecords);
  });

  // Endpoint for creating a new medication
  app.post("/medications", (req, res) => {
    const medication: Medication = {
      id: uuidv4(),
      createdAt: getCurrentDate(),
      ...req.body,
    };
    medicationsStorage.insert(medication.id, medication);
    res.json(medication);
  });

  // Endpoint for retrieving all medications
  app.get("/medications", (req, res) => {
    res.json(medicationsStorage.values());
  });

  // Endpoint for retrieving medications for a specific patient
  app.get("/medications/patient/:id", (req, res) => {
    const patientId = req.params.id;
    const medications = medicationsStorage
      .values()
      .filter((medication) => medication.patientId === patientId);
    res.json(medications);
  });

  // Start the server
  return app.listen();
});

// Function to get the current date
function getCurrentDate() {
  const timestamp = new Number(ic.time());
  return new Date(timestamp.valueOf() / 1000_000);
}
