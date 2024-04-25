// Import necessary libraries
import { v4 as uuidv4 } from "uuid";
import { Server, StableBTreeMap, ic } from "azle";
import express from "express";

// Define the Doctor class with a constructor
class Doctor {
  id: string;
  name: string;
  speciality: string;
  createdAt: Date;

  constructor(name: string, speciality: string) {
    this.id = uuidv4();
    this.name = name;
    this.speciality = speciality;
    this.createdAt = getCurrentDate();
  }
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
    // Validate the doctor payload
    if (
      !req.body.name ||
      typeof req.body.name !== "string" ||
      !req.body.speciality ||
      typeof req.body.speciality !== "string"
    ) {
      res.status(400).json({
        status: 400,
        error:
          "Invalid input: Ensure 'name' and 'speciality' are provided and are strings.",
      });
      return;
    }

    // Attempt to create a new Doctor instance
    try {
      const doctor = new Doctor(req.body.name, req.body.speciality);

      doctorsStorage.insert(doctor.id, doctor);
      // Send Success message with the created doctor
      res.status(201).json({
        status: 201,
        message: "Doctor created successfully",
        doctor,
      });
    } catch (error) {
      // Send an error message if an error occurred while creating the doctor
      console.error("Failed to create doctor", error);
      res
        .status(500)
        .json({ error: "An error occurred while creating a new doctor." });
    }
  });

  // Endpoint for retrieving all doctors
  app.get("/doctors", (req, res) => {
    // Attempt to retrieve all doctors
    try {
      const doctors = doctorsStorage.values();
      res.status(200).json({
        status: 200,
        message: "Doctors retrieved successfully",
        doctors: doctors,
      });
    } catch (error) {
      // Send an error message if an error occurred while retrieving the doctors
      console.error("Failed to retrieve doctors", error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving doctors." });
    }
  });

  // Endpoint for retrieving a specific doctor by ID
  app.get("/doctors/:id", (req, res) => {
    const doctorId = req.params.id;
    const doctorOpt = doctorsStorage.get(doctorId);
    if ("None" in doctorOpt) {
      res.status(404).json({
        status: 404,
        message: `Doctor with id = ${doctorId} not found`,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Doctor retrieved successfully",
        doctor: doctorOpt.Some,
      });
    }
  });

  // Pagination endpoint for retrieving doctors
  app.get("/doctors/paginate/pages", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    const doctors = doctorsStorage.values();
    const results = doctors.slice(startIndex, endIndex);
    
    res.json(results);
  });

  // Endpoint for updating a doctor
  app.put("/doctors/:id", (req, res) => {
    // Validate the doctor payload
    if (
      !req.body.name ||
      typeof req.body.name !== "string" ||
      !req.body.speciality ||
      typeof req.body.speciality !== "string"
    ) {
      res.status(400).json({
        error:
          "Invalid input: Ensure 'name' and 'speciality' are provided and are strings.",
      });
      return;
    }
    const doctorId = req.params.id;
    const doctorOpt = doctorsStorage.get(doctorId);
    if ("None" in doctorOpt) {
      res.status(404).json({
        status: 404,
        message: `Doctor with id = ${doctorId} not found`,
      });
    } else {
      const doctor = doctorOpt.Some;
      const updatedDoctor = {
        ...doctor,
        ...req.body,
        updatedAt: getCurrentDate(),
      };
      doctorsStorage.insert(doctor.id, updatedDoctor);
      res.status(200).json({
        status: 200,
        message: "Doctor updated successfully",
        doctor: updatedDoctor,
      });
    }
  });

  // Endpoint for deleting a doctor
  app.delete("/doctors/:id", (req, res) => {
    const doctorId = req.params.id;
    const deletedDoctor = doctorsStorage.remove(doctorId);
    if ("None" in deletedDoctor) {
      res.status(404).json({
        status: 404,
        message: `Doctor with id = ${doctorId} not found`,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Doctor deleted successfully",
        doctor: deletedDoctor.Some,
      });
    }
  });

  // Endpoint for creating a new patient
  app.post("/patients", (req, res) => {
    // Validate the patient payload
    if (
      !req.body.name ||
      typeof req.body.name !== "string" ||
      !req.body.age ||
      typeof req.body.age !== "number" ||
      !req.body.gender ||
      typeof req.body.gender !== "string"
    ) {
      res.status(400).json({
        status: 400,
        error:
          "Invalid input: Ensure 'name' is a string, 'age' is a number and 'gender' is a string.",
      });

      return;
    }

    // Attempt to create a new Patient instance
    try {
      const patient: Patient = {
        id: uuidv4(),
        createdAt: getCurrentDate(),
        ...req.body,
      };
      patientsStorage.insert(patient.id, patient);
      // Send Success message with the created patient
      res.status(201).json({
        status: 201,
        message: "Patient created successfully",
        patient,
      });
    } catch (error) {
      // Send an error message if an error occurred while creating the patient
      console.error("Failed to create patient", error);
      res
        .status(500)
        .json({ error: "An error occurred while creating a new patient." });
    }
  });

  // Endpoint for retrieving all patients
  app.get("/patients", (req, res) => {
    // Attempt to retrieve all patients
    try {
      const patients = patientsStorage.values();
      res.status(200).json({
        status: 200,
        message: "Patients retrieved successfully",
        patients: patients,
      });
    } catch (error) {
      // Send an error message if an error occurred while retrieving the patients
      console.error("Failed to retrieve patients", error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving patients." });
    }
  });

  // Endpoint for retrieving a specific patient by ID
  app.get("/patients/:id", (req, res) => {
    const patientId = req.params.id;
    const patientOpt = patientsStorage.get(patientId);
    if ("None" in patientOpt) {
      res.status(404).json({
        status: 404,
        message: `Patient with id = ${patientId} not found`,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Patient retrieved successfully",
        patient: patientOpt.Some,
      });
    }
  });

  // Pagination endpoint for retrieving patients
  app.get("/patients/paginate/pages", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const patients = patientsStorage.values();
    const results = patients.slice(startIndex, endIndex);

    res.json(results);
  });

  // Endpoint for updating a patient
  app.put("/patients/:id", (req, res) => {
    // Validate the patient payload
    if (
      !req.body.name ||
      typeof req.body.name !== "string" ||
      !req.body.age ||
      typeof req.body.age !== "number" ||
      !req.body.gender ||
      typeof req.body.gender !== "string"
    ) {
      res.status(400).json({
        error:
          "Invalid input: Ensure 'name' is a string, 'age' is a number and gender is a string.",
      });

      return;
    }

    const patientId = req.params.id;
    const patientOpt = patientsStorage.get(patientId);
    if ("None" in patientOpt) {
      res.status(404).json({
        status: 404,
        message: `Patient with id = ${patientId} not found`,
      });
    } else {
      const patient = patientOpt.Some;
      const updatedPatient = {
        ...patient,
        ...req.body,
        updatedAt: getCurrentDate(),
      };
      patientsStorage.insert(patient.id, updatedPatient);
      res.status(200).json({
        status: 200,
        message: "Patient updated successfully",
        patient: updatedPatient,
      });
    }
  });

  // Endpoint for deleting a patient
  app.delete("/patients/:id", (req, res) => {
    const patientId = req.params.id;
    const deletedPatient = patientsStorage.remove(patientId);
    if ("None" in deletedPatient) {
      res.status(404).json({
        status: 404,
        message: `Patient with id = ${patientId} not found`,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Patient deleted successfully",
        patient: deletedPatient.Some,
      });
    }
  });

  // Endpoint for creating a new appointment
  app.post("/appointments", (req, res) => {
    // Validate the appointment payload
    if (
      !req.body.patientId ||
      typeof req.body.patientId !== "string" ||
      !req.body.doctorId ||
      typeof req.body.doctorId !== "string" ||
      !req.body.dateTime ||
      typeof req.body.dateTime !== "string" ||
      !req.body.duration ||
      typeof req.body.duration !== "number" ||
      !req.body.description ||
      typeof req.body.description !== "string"
    ) {
      res.status(400).json({
        status: 400,
        error:
          "Invalid input: Ensure 'patientId', 'doctorId', 'dateTime', 'duration' and 'description' are provided and are of the correct type.",
      });
      return;
    }

    // Attempt to create a new Appointment instance
    try {
      const appointment: Appointment = {
        id: uuidv4(),
        createdAt: getCurrentDate(),
        ...req.body,
      };
      appointmentsStorage.insert(appointment.id, appointment);
      // Send Success message with the created appointment
      res.status(201).json({
        status: 201,
        message: "Appointment created successfully",
        appointment,
      });
    } catch (error) {
      // Send an error message if an error occurred while creating the appointment
      console.error("Failed to create appointment", error);
      res
        .status(500)
        .json({ error: "An error occurred while creating a new appointment." });
    }
  });

  // Endpoint for retrieving all appointments
  app.get("/appointments", (req, res) => {
    // Attempt to retrieve all appointments
    try {
      const appointments = appointmentsStorage.values();
      res.status(200).json({
        status: 200,
        message: "Appointments retrieved successfully",
        appointments: appointments,
      });
    } catch (error) {
      // Send an error message if an error occurred while retrieving the appointments
      console.error("Failed to retrieve appointments", error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving appointments." });
    }
  });

  // Pagination endpoint for retrieving appointments
  app.get("/appointments/paginate/pages", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const appointments = appointmentsStorage.values();
    const results = appointments.slice(startIndex, endIndex);

    res.json(results);
  });

  // Endpoint for retrieving a specific appointment by ID
  app.get("/appointments/:id", (req, res) => {
    const appointmentId = req.params.id;
    const appointmentOpt = appointmentsStorage.get(appointmentId);
    if ("None" in appointmentOpt) {
      res.status(404).json({
        status: 404,
        message: `Appointment with id = ${appointmentId} not found`,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Appointment retrieved successfully",
        appointment: appointmentOpt.Some,
      });
    }
  });

  // Endpoint for updating an appointment
  app.put("/appointments/:id", (req, res) => {
    // Validate the appointment payload
    if (
      !req.body.patientId ||
      typeof req.body.patientId !== "string" ||
      !req.body.doctorId ||
      typeof req.body.doctorId !== "string" ||
      !req.body.dateTime ||
      typeof req.body.dateTime !== "string" ||
      !req.body.duration ||
      typeof req.body.duration !== "number" ||
      !req.body.description ||
      typeof req.body.description !== "string"
    ) {
      res.status(400).json({
        error:
          "Invalid input: Ensure 'patientId', 'doctorId', 'dateTime', 'duration' and 'description' are provided and are of the correct type.",
      });
      return;
    }

    const appointmentId = req.params.id;
    const appointmentOpt = appointmentsStorage.get(appointmentId);
    if ("None" in appointmentOpt) {
      res.status(404).json({
        status: 404,
        message: `Appointment with id = ${appointmentId} not found`,
      });
    } else {
      const appointment = appointmentOpt.Some;
      const updatedAppointment = {
        ...appointment,
        ...req.body,
        updatedAt: getCurrentDate(),
      };
      appointmentsStorage.insert(appointment.id, updatedAppointment);
      res.status(200).json({
        status: 200,
        message: "Appointment updated successfully",
        appointment: updatedAppointment,
      });
    }
  });

  // Endpoint for deleting an appointment
  app.delete("/appointments/:id", (req, res) => {
    const appointmentId = req.params.id;
    const deletedAppointment = appointmentsStorage.remove(appointmentId);
    if ("None" in deletedAppointment) {
      res.status(404).json({
        status: 404,
        message: `Appointment with id = ${appointmentId} not found`,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Appointment deleted successfully",
        appointment: deletedAppointment.Some,
      });
    }
  });

  // Endpoint for creating a new patient record
  app.post("/patient-records", (req, res) => {
    // Validate the patient record payload
    if (
      !req.body.patientId ||
      typeof req.body.patientId !== "string" ||
      !req.body.doctorId ||
      typeof req.body.doctorId !== "string" ||
      !req.body.diagnosis ||
      typeof req.body.diagnosis !== "string" ||
      !req.body.treatment ||
      typeof req.body.treatment !== "string" ||
      !req.body.medications ||
      !Array.isArray(req.body.medications)
    ) {
      res.status(400).json({
        status: 400,
        error:
          "Invalid input: Ensure 'patientId', 'doctorId', 'diagnosis', 'treatment' and 'medications' are provided and are of the correct type.",
      });
      return;
    }

    // Attempt to create a new PatientRecord instance
    try {
      const patientRecord: PatientRecord = {
        id: uuidv4(),
        createdAt: getCurrentDate(),
        ...req.body,
      };
      patientRecordsStorage.insert(patientRecord.id, patientRecord);
      // Send Success message with the created patient record
      res.status(201).json({
        status: 201,
        message: "Patient record created successfully",
        patientRecord,
      });
    } catch (error) {
      // Send an error message if an error occurred while creating the patient record
      console.error("Failed to create patient record", error);
      res
        .status(500)
        .json({
          error: "An error occurred while creating a new patient record.",
        });
    }
  });

  // Endpoint for retrieving all patient records
  app.get("/patient-records", (req, res) => {
    // Attempt to retrieve all patient records
    try {
      const patientRecords = patientRecordsStorage.values();
      res.status(200).json({
        status: 200,
        message: "Patient records retrieved successfully",
        patientRecords: patientRecords,
      });
    } catch (error) {
      // Send an error message if an error occurred while retrieving the patient records
      console.error("Failed to retrieve patient records", error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving patient records." });
    }
  });

  // Endpoint for retrieving patient records for a specific doctor
  app.get("/patient-records/doctor/:id", (req, res) => {
    const doctorId = req.params.id;
    const patientRecords = patientRecordsStorage.get(doctorId);
    if ("None" in patientRecords) {
      res.status(404).json({
        status: 404,
        message: `Patient records for doctor with id = ${doctorId} not found`,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Patient records retrieved successfully",
        patientRecords: patientRecords.Some,
      });
    }
  });

  // Endpoint for retrieving patient records for a specific patient
  app.get("/patient-records/patient/:id", (req, res) => {
    const patientId = req.params.id;
    const patientRecords = patientRecordsStorage.get(patientId);
    if ("None" in patientRecords) {
      res.status(404).json({
        status: 404,
        message: `Patient records for patient with id = ${patientId} not found`,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Patient records retrieved successfully",
        patientRecords: patientRecords.Some,
      });
    }
  });

  // Pagination endpoint for retrieving patient records
  app.get("/patient-records/paginate/pages", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const patientRecords = patientRecordsStorage.values();
    const results = patientRecords.slice(startIndex, endIndex);

    res.json(results);
  });

  // Endpoint for updating a patient record
  app.put("/patient-records/:id", (req, res) => {
    // Validate the patient record payload
    if (
      !req.body.patientId ||
      typeof req.body.patientId !== "string" ||
      !req.body.doctorId ||
      typeof req.body.doctorId !== "string" ||
      !req.body.diagnosis ||
      typeof req.body.diagnosis !== "string" ||
      !req.body.treatment ||
      typeof req.body.treatment !== "string" ||
      !req.body.medications ||
      !Array.isArray(req.body.medications)
    ) {
      res.status(400).json({
        error:
          "Invalid input: Ensure 'patientId', 'doctorId', 'diagnosis', 'treatment' and 'medications' are provided and are of the correct type.",
      });
      return;
    }

    const patientRecordId = req.params.id;
    const patientRecordOpt = patientRecordsStorage.get(patientRecordId);
    if ("None" in patientRecordOpt) {
      res.status(404).json({
        status: 404,
        message: `Patient record with id = ${patientRecordId} not found`,
      });
    } else {
      const patientRecord = patientRecordOpt.Some;
      const updatedPatientRecord = {
        ...patientRecord,
        ...req.body,
        updatedAt: getCurrentDate(),
      };
      patientRecordsStorage.insert(patientRecord.id, updatedPatientRecord);
      res.status(200).json({
        status: 200,
        message: "Patient record updated successfully",
        patientRecord: updatedPatientRecord,
      });
    }
  });

  // Endpoint for deleting a patient record
  app.delete("/patient-records/:id", (req, res) => {
    const patientRecordId = req.params.id;
    const deletedPatientRecord = patientRecordsStorage.remove(patientRecordId);
    if ("None" in deletedPatientRecord) {
      res.status(404).json({
        status: 404,
        message: `Patient record with id = ${patientRecordId} not found`,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Patient record deleted successfully",
        patientRecord: deletedPatientRecord.Some,
      });
    }
  });

  // Endpoint for creating a new medication
  app.post("/medications", (req, res) => {
    // Validate the medication payload
    if (
      !req.body.name ||
      typeof req.body.name !== "string" ||
      !req.body.dosage ||
      typeof req.body.dosage !== "string" ||
      !req.body.frequency ||
      typeof req.body.frequency !== "string" ||
      !req.body.patientId ||
      typeof req.body.patientId !== "string"
    ) {
      res.status(400).json({
        status: 400,
        error:
          "Invalid input: Ensure 'name', 'dosage', 'frequency' and 'patientId' are provided and are of the correct type.",
      });
      return;
    }

    // Attempt to create a new Medication instance
    try {
      const medication: Medication = {
        id: uuidv4(),
        createdAt: getCurrentDate(),
        ...req.body,
      };
      medicationsStorage.insert(medication.id, medication);
      // Send Success message with the created medication
      res.status(201).json({
        status: 201,
        message: "Medication created successfully",
        medication,
      });
    } catch (error) {
      // Send an error message if an error occurred while creating the medication
      console.error("Failed to create medication", error);
      res
        .status(500)
        .json({ error: "An error occurred while creating a new medication." });
    }
  });

  // Endpoint for retrieving all medications
  app.get("/medications", (req, res) => {
    // Attempt to retrieve all medications
    try {
      const medications = medicationsStorage.values();
      res.status(200).json({
        status: 200,
        message: "Medications retrieved successfully",
        medications: medications,
      });
    } catch (error) {
      // Send an error message if an error occurred while retrieving the medications
      console.error("Failed to retrieve medications", error);
      res
        .status(500)
        .json({ error: "An error occurred while retrieving medications." });
    }
  });

  // Endpoint for retrieving medications for a specific patient
  app.get("/medications/patient/:id", (req, res) => {
    const patientId = req.params.id;
    const medications = medicationsStorage.get(patientId);
    if ("None" in medications) {
      res.status(404).json({
        status: 404,
        message: `Medications for patient with id = ${patientId} not found`,
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Medications retrieved successfully",
        medications: medications.Some,
      });
    }
  });

  // Pagination endpoint for retrieving medications
  app.get("/medications/paginate/pages", (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const medications = medicationsStorage.values();
    const results = medications.slice(startIndex, endIndex);

    res.json(results);
  });

  // Start the server
  return app.listen();
});

// Function to get the current date
function getCurrentDate() {
  const timestamp = new Number(ic.time());
  return new Date(timestamp.valueOf() / 1000_000);
}