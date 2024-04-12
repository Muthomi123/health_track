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

  constructor(name: string, specialty: string) {
    this.id = uuidv4();
    this.name = name;
    this.specialty = specialty;
    this.createdAt = new Date();
  }
}

// Define the Patient class to represent patients
class Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  createdAt: Date;

  constructor(name: string, age: number, gender: string) {
    this.id = uuidv4();
    this.name = name;
    this.age = age;
    this.gender = gender;
    this.createdAt = new Date();
  }
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

  constructor(patientId: string, doctorId: string, dateTime: Date, duration: number, description: string) {
    this.id = uuidv4();
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.dateTime = dateTime;
    this.duration = duration;
    this.description = description;
    this.createdAt = new Date();
    this.updatedAt = null;
  }
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

  constructor(patientId: string, doctorId: string, diagnosis: string, treatment: string, medications: string[]) {
    this.id = uuidv4();
    this.patientId = patientId;
    this.doctorId = doctorId;
    this.diagnosis = diagnosis;
    this.treatment = treatment;
    this.medications = medications;
    this.createdAt = new Date();
  }
}

// Define the Medication class to represent medications
class Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  patientId: string;
  createdAt: Date;

  constructor(name: string, dosage: string, frequency: string, patientId: string) {
    this.id = uuidv4();
    this.name = name;
    this.dosage = dosage;
    this.frequency = frequency;
    this.patientId = patientId;
    this.createdAt = new Date();
  }
}

// Initialize stable maps for storing doctors, patients, appointments, patient records, and medications
const doctorsStorage = StableBTreeMap<string, Doctor>(0);
const patientsStorage = StableBTreeMap<string, Patient>(1);
const appointmentsStorage = StableBTreeMap<string, Appointment>(2);
const patientRecordsStorage = StableBTreeMap<string, PatientRecord>(3);
const medicationsStorage = StableBTreeMap<string, Medication>(4);

// Define the express server
export default Server(() => {
  const app = express();
  app.use(express.json());

  // Endpoint for creating a new doctor
  app.post("/doctors", (req, res) => {
    const { name, specialty } = req.body;
    const doctor = new Doctor(name, specialty);
    doctorsStorage.insert(doctor.id, doctor);
    res.json(doctor);
  });

  // Endpoint for retrieving all doctors
  app.get("/doctors", (req, res) => {
    res.json(doctorsStorage.values());
  });

  // Endpoint for creating a new patient
  app.post("/patients", (req, res) => {
    const { name, age, gender } = req.body;
    const patient = new Patient(name, age, gender);
    patientsStorage.insert(patient.id, patient);
    res.json(patient);
  });

  // Endpoint for retrieving all patients
  app.get("/patients", (req, res) => {
    res.json(patientsStorage.values());
  });

  // Endpoint for creating a new appointment
  app.post("/appointments", (req, res) => {
    const { patientId, doctorId, dateTime, duration, description } = req.body;
    const appointment = new Appointment(patientId, doctorId, new Date(dateTime), duration, description);
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
    const appointment = appointmentsStorage.get(appointmentId);
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).send(`Appointment with ID ${appointmentId} not found`);
    }
  });

  // Endpoint for updating an appointment
  app.put("/appointments/:id", (req, res) => {
    const appointmentId = req.params.id;
    const appointment = appointmentsStorage.get(appointmentId);
    if (appointment) {
      const { patientId, doctorId, dateTime, duration, description } = req.body;
      const updatedAppointment = new Appointment(patientId, doctorId, new Date(dateTime), duration, description);
      updatedAppointment.updatedAt = new Date();
      appointmentsStorage.insert(appointmentId, updatedAppointment);
      res.json(updatedAppointment);
    } else {
      res.status(404).send(`Appointment with ID ${appointmentId} not found`);
    }
  });

  // Endpoint for deleting an appointment
  app.delete("/appointments/:id", (req, res) => {
    const appointmentId = req.params.id;
    const appointment = appointmentsStorage.remove(appointmentId);
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).send(`Appointment with ID ${appointmentId} not found`);
    }
  });

  // Endpoint for creating a new patient record
  app.post("/patient-records", (req, res) => {
    const { patientId, doctorId, diagnosis, treatment, medications } = req.body;
    const patientRecord = new PatientRecord(patientId, doctorId, diagnosis, treatment, medications);
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
    const { name, dosage, frequency, patientId } = req.body;
    const medication = new Medication(name, dosage, frequency, patientId);
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
  const timestamp = ic.time();
  return new Date(timestamp / 1000000);
}
