// Seeds the database with DUMMY data only. Safe to run repeatedly: it wipes and re-creates everything.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const day = (offset: number) => new Date(Date.now() + offset * 86400000);

type MilestoneSeed = [title: string, dueOffset: number, done: boolean];

const projects: {
  name: string; vertical: string; city: string; manager: string; status: string;
  budget: number; spent: number; start: number; end: number; description: string; milestones: MilestoneSeed[];
}[] = [
  {
    name: 'Harbour Link Sea Bridge', vertical: 'Infrastructure', city: 'Metro City A', manager: 'Meera Manager', status: 'On Track',
    budget: 4200, spent: 2650, start: -540, end: 260, description: 'A 12 km coastal bridge connecting two business districts (dummy project).',
    milestones: [['Survey & design freeze', -500, true], ['Foundation piling', -380, true], ['Pier construction', -200, true], ['Deck launching', 30, false], ['Finishing & safety audit', 200, false]],
  },
  {
    name: 'Metro Line 4 Elevated Corridor', vertical: 'Infrastructure', city: 'Metro City B', manager: 'Meera Manager', status: 'At Risk',
    budget: 6800, spent: 4900, start: -700, end: 150, description: '27 km elevated metro corridor with 22 stations (dummy project).',
    milestones: [['Land clearance', -690, true], ['Viaduct segments', -400, true], ['Station structures', -60, false], ['Track & signalling', 60, false], ['Trial runs', 130, false]],
  },
  {
    name: 'Solar Park Alpha', vertical: 'Energy', city: 'Desert Zone 1', manager: 'Rohan Rao', status: 'On Track',
    budget: 1900, spent: 1400, start: -420, end: 60, description: '250 MW photovoltaic park with battery storage (dummy project).',
    milestones: [['Site grading', -400, true], ['Module installation', -150, true], ['Grid synchronisation', -10, true], ['Battery commissioning', 45, false]],
  },
  {
    name: 'Green Hydrogen Pilot Plant', vertical: 'Energy', city: 'Port Cluster C', manager: 'Isha Iyer', status: 'Planning',
    budget: 950, spent: 120, start: -60, end: 520, description: 'Electrolyser plant producing green hydrogen at pilot scale (dummy project).',
    milestones: [['Feasibility study', -40, true], ['Electrolyser procurement', 60, false], ['Plant construction', 240, false], ['Commissioning', 500, false]],
  },
  {
    name: 'Integrated Water Treatment Hub', vertical: 'Utilities & Metals', city: 'River Basin D', manager: 'Neha Nair', status: 'Delayed',
    budget: 780, spent: 690, start: -600, end: -20, description: '120 MLD water treatment and distribution network (dummy project).',
    milestones: [['Intake works', -560, true], ['Treatment units', -300, true], ['Distribution pipelines', -90, false], ['Handover', -10, false]],
  },
  {
    name: 'Specialty Steel Mill Upgrade', vertical: 'Utilities & Metals', city: 'Industrial Belt E', manager: 'Vikram Varma', status: 'On Track',
    budget: 2300, spent: 1100, start: -300, end: 330, description: 'Capacity and automation upgrade for a rolling mill (dummy project).',
    milestones: [['Equipment design', -280, true], ['Foundation & civil', -150, true], ['Mechanical erection', 80, false], ['Hot trials', 300, false]],
  },
  {
    name: 'Skyline Residences Tower', vertical: 'Realty', city: 'Metro City A', manager: 'Tara Thomas', status: 'Completed',
    budget: 1250, spent: 1210, start: -900, end: -40, description: '48-storey premium residential tower (dummy project).',
    milestones: [['Excavation', -880, true], ['Core & shell', -500, true], ['Interiors', -120, true], ['Handover', -40, true]],
  },
  {
    name: 'Hyperscale Data Centre Campus', vertical: 'Technology', city: 'Tech Park F', manager: 'Dev Desai', status: 'On Track',
    budget: 3100, spent: 1500, start: -240, end: 400, description: '60 MW data centre campus with renewable power supply (dummy project).',
    milestones: [['Shell construction', -200, true], ['Power & cooling', 20, false], ['Rack fit-out', 200, false], ['Go-live', 380, false]],
  },
];

async function main() {
  // wipe in dependency order
  await db.enquiry.deleteMany();
  await db.favorite.deleteMany();
  await db.loanApplication.deleteMany();
  await db.milestone.deleteMany();
  await db.project.deleteMany();
  await db.property.deleteMany();
  await db.loanProduct.deleteMany();
  await db.plant.deleteMany();
  await db.knowledgeChunk.deleteMany();
  await db.user.deleteMany();

  await db.user.createMany({
    data: [
      { name: 'Aarav Admin', email: 'admin@nexus.demo', passwordHash: bcrypt.hashSync('Admin@123', 10), role: 'admin' },
      { name: 'Meera Manager', email: 'manager@nexus.demo', passwordHash: bcrypt.hashSync('Manager@123', 10), role: 'manager' },
      { name: 'Karan Customer', email: 'customer@nexus.demo', passwordHash: bcrypt.hashSync('Customer@123', 10), role: 'customer' },
    ],
  });

  for (const p of projects) {
    await db.project.create({
      data: {
        name: p.name, vertical: p.vertical, city: p.city, manager: p.manager, status: p.status,
        budget: p.budget, spent: p.spent, start: day(p.start), end: day(p.end), description: p.description,
        milestones: { create: p.milestones.map(([title, due, done]) => ({ title, due: day(due), done })) },
      },
    });
  }

  await db.plant.createMany({
    data: [
      { id: 'solar-1', name: 'Solar Park Alpha', type: 'Solar', capacity: 250, unit: 'MW', base: 0.7 },
      { id: 'hydro-1', name: 'Hydro Unit Beta', type: 'Hydro', capacity: 180, unit: 'MW', base: 0.62 },
      { id: 'water-1', name: 'Water Treatment Gamma', type: 'Water', capacity: 120, unit: 'MLD', base: 0.75 },
      { id: 'steel-1', name: 'Steel Mill Delta', type: 'Metals', capacity: 300, unit: 'kt/mo', base: 0.8 },
    ],
  });

  await db.loanProduct.createMany({
    data: [
      { id: 'home', name: 'Home Loan', rate: 8.6, minAmount: 500000, maxAmount: 50000000, maxTenureMonths: 360, blurb: 'Buy or build your dream home.' },
      { id: 'vehicle', name: 'Vehicle Loan', rate: 9.8, minAmount: 100000, maxAmount: 5000000, maxTenureMonths: 84, blurb: 'Finance a car or commercial vehicle.' },
      { id: 'business', name: 'Business Loan', rate: 12.5, minAmount: 200000, maxAmount: 20000000, maxTenureMonths: 120, blurb: 'Working capital and expansion funding.' },
      { id: 'farm', name: 'Farm Equipment Loan', rate: 10.4, minAmount: 50000, maxAmount: 3000000, maxTenureMonths: 72, blurb: 'Tractors and agri-machinery finance.' },
    ],
  });

  await db.property.createMany({
    data: [
      { title: 'Skyline Heights 2BHK', city: 'Metro City A', type: 'Apartment', bedrooms: 2, areaSqft: 1050, price: 185, status: 'Ready', amenities: 'Gym,Pool,Parking' },
      { title: 'Skyline Heights 3BHK', city: 'Metro City A', type: 'Apartment', bedrooms: 3, areaSqft: 1520, price: 275, status: 'Under construction', amenities: 'Gym,Clubhouse,Parking' },
      { title: 'Lakeview Villa', city: 'Metro City B', type: 'Villa', bedrooms: 4, areaSqft: 3200, price: 620, status: 'Ready', amenities: 'Garden,Pool,Smart home' },
      { title: 'Green Meadows 2BHK', city: 'Metro City B', type: 'Apartment', bedrooms: 2, areaSqft: 980, price: 120, status: 'Under construction', amenities: 'Park,Parking' },
      { title: 'Business Bay Office Floor', city: 'Tech Park F', type: 'Office', bedrooms: 0, areaSqft: 5400, price: 880, status: 'Ready', amenities: 'Power backup,Cafeteria,Parking' },
      { title: 'Harbour View 3BHK', city: 'Port Cluster C', type: 'Apartment', bedrooms: 3, areaSqft: 1480, price: 210, status: 'Ready', amenities: 'Sea view,Gym,Pool' },
      { title: 'Orchid Villa Estate', city: 'Tech Park F', type: 'Villa', bedrooms: 5, areaSqft: 4100, price: 790, status: 'Under construction', amenities: 'Private lift,Theatre,Garden' },
      { title: 'Metro Studio Apartments', city: 'Metro City A', type: 'Apartment', bedrooms: 1, areaSqft: 560, price: 78, status: 'Ready', amenities: 'Co-working,Parking' },
    ],
  });

  await db.knowledgeChunk.createMany({
    data: [
      { doc: 'Project Handbook (dummy)', text: 'Every project is tracked through milestones. A project is marked At Risk when spend exceeds progress by more than twenty five percent, and Delayed when the planned end date has passed.' },
      { doc: 'Project Handbook (dummy)', text: 'Project managers can mark milestones as completed. Completing all milestones sets the project status to Completed.' },
      { doc: 'Safety Policy (dummy)', text: 'Site safety audits are carried out every quarter. Any critical finding must be closed within seven days and reported to the project manager.' },
      { doc: 'Loan FAQ (dummy)', text: 'Loan eligibility depends on credit score, monthly income, existing obligations and employment type. The EMI to income ratio should stay below fifty percent.' },
      { doc: 'Loan FAQ (dummy)', text: 'A loan application moves through Submitted, Under Review and then Approved or Rejected. You can track the stage on the My Applications tab.' },
      { doc: 'Energy Operations Guide (dummy)', text: 'Plant output is monitored in real time. A warning alert is raised when temperature crosses ninety degrees or output falls below thirty percent of capacity.' },
      { doc: 'Realty FAQ (dummy)', text: 'Customers can save properties as favourites and book a site visit by sending an enquiry with a preferred time slot.' },
    ],
  });

  console.log('Seeded dummy data: 3 users, %d projects, 4 plants, 4 loan products, 8 properties.', projects.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
