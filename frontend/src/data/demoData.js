import img1 from '../assets/demo/agri-01.svg'
import img2 from '../assets/demo/agri-02.svg'
import img3 from '../assets/demo/agri-03.svg'
import img4 from '../assets/demo/agri-04.svg'
import img5 from '../assets/demo/agri-05.svg'
import img6 from '../assets/demo/agri-06.svg'
import img7 from '../assets/demo/agri-07.svg'
import img8 from '../assets/demo/agri-08.svg'
import img9 from '../assets/demo/agri-09.svg'
import img10 from '../assets/demo/agri-10.svg'

const images = {1: img1, 2: img2, 3: img3, 4: img4, 5: img5, 6: img6, 7: img7, 8: img8, 9: img9, 10: img10}
const img = (n) => images[n]
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`

export const DEMO_LANDS = [
  { id: id(1), land_name: 'North Field', village: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', area_acres: 42.5, soil_type: 'Black Soil', irrigation_type: 'Drip Irrigation', image_url: img(1) },
  { id: id(2), land_name: 'Green Valley Farm', village: 'Sehore', district: 'Sehore', state: 'Madhya Pradesh', area_acres: 28, soil_type: 'Loamy', irrigation_type: 'Sprinkler', image_url: img(2) },
  { id: id(3), land_name: 'Sunrise Estate', village: 'Indore', district: 'Indore', state: 'Madhya Pradesh', area_acres: 65.75, soil_type: 'Alluvial', irrigation_type: 'Drip', image_url: img(3) },
  { id: id(4), land_name: 'Riverbank Plot', village: 'Harda', district: 'Harda', state: 'Madhya Pradesh', area_acres: 18.2, soil_type: 'Sandy Loam', irrigation_type: 'Canal', image_url: img(4) },
  { id: id(5), land_name: 'Harvest Ridge', village: 'Vidisha', district: 'Vidisha', state: 'Madhya Pradesh', area_acres: 37.4, soil_type: 'Black Soil', irrigation_type: 'Borewell', image_url: img(5) },
  { id: id(6), land_name: 'Mango Grove', village: 'Raisen', district: 'Raisen', state: 'Madhya Pradesh', area_acres: 12.8, soil_type: 'Red Loam', irrigation_type: 'Drip', image_url: img(6) },
  { id: id(7), land_name: 'Golden Acres', village: 'Dewas', district: 'Dewas', state: 'Madhya Pradesh', area_acres: 54.3, soil_type: 'Clay Loam', irrigation_type: 'Sprinkler', image_url: img(7) },
  { id: id(8), land_name: 'Meadow Farm', village: 'Ujjain', district: 'Ujjain', state: 'Madhya Pradesh', area_acres: 31.6, soil_type: 'Alluvial', irrigation_type: 'Canal', image_url: img(8) },
]

export const DEMO_CROPS = [
  { id: id(11), land_id: id(1), crop_name: 'Wheat', season: 'Rabi', sowing_date: '2026-11-12', expected_harvest_date: '2027-03-20', expected_yield: 185, image_url: img(2) },
  { id: id(12), land_id: id(2), crop_name: 'Soybean', season: 'Kharif', sowing_date: '2026-07-08', expected_harvest_date: '2026-10-05', expected_yield: 142, image_url: img(3) },
  { id: id(13), land_id: id(3), crop_name: 'Cotton', season: 'Kharif', sowing_date: '2026-06-22', expected_harvest_date: '2026-11-15', expected_yield: 96, image_url: img(4) },
  { id: id(14), land_id: id(4), crop_name: 'Rice', season: 'Kharif', sowing_date: '2026-06-30', expected_harvest_date: '2026-10-18', expected_yield: 210, image_url: img(5) },
  { id: id(15), land_id: id(5), crop_name: 'Chickpea', season: 'Rabi', sowing_date: '2026-11-20', expected_harvest_date: '2027-03-28', expected_yield: 118, image_url: img(6) },
  { id: id(16), land_id: id(6), crop_name: 'Tomato', season: 'Zaid', sowing_date: '2026-03-14', expected_harvest_date: '2026-06-25', expected_yield: 82, image_url: img(7) },
  { id: id(17), land_id: id(7), crop_name: 'Maize', season: 'Kharif', sowing_date: '2026-07-02', expected_harvest_date: '2026-10-12', expected_yield: 164, image_url: img(8) },
  { id: id(18), land_id: id(8), crop_name: 'Mustard', season: 'Rabi', sowing_date: '2026-11-15', expected_harvest_date: '2027-03-10', expected_yield: 74, image_url: img(9) },
]

export const DEMO_CONTRACTS = [
  { id: id(21), title: 'Premium Wheat Supply — Rabi 2027', description: 'Long-term supply agreement for premium grade wheat with quality inspection at pickup.', quantity: 185, price_per_unit: 2450, start_date: '2027-03-20', end_date: '2027-04-05', status: 'OPEN', farmer_id: id(1), buyer_id: null, crop_name: 'Wheat', land_name: 'North Field', image_url: img(2) },
  { id: id(22), title: 'Soybean Procurement Program', description: 'Bulk soybean procurement for an established food-processing buyer.', quantity: 142, price_per_unit: 5150, start_date: '2026-10-05', end_date: '2026-10-20', status: 'ACCEPTED', farmer_id: id(2), buyer_id: id(101), crop_name: 'Soybean', land_name: 'Green Valley Farm', image_url: img(3) },
  { id: id(23), title: 'Cotton Grade-A Offtake', description: 'Cotton offtake contract with transparent grading and scheduled pickup.', quantity: 96, price_per_unit: 7350, start_date: '2026-11-15', end_date: '2026-12-05', status: 'OPEN', farmer_id: id(3), buyer_id: null, crop_name: 'Cotton', land_name: 'Sunrise Estate', image_url: img(4) },
  { id: id(24), title: 'Rice Mill Supply Contract', description: 'Assured purchase for high-quality paddy delivered to a regional rice mill.', quantity: 210, price_per_unit: 2250, start_date: '2026-10-18', end_date: '2026-11-01', status: 'OPEN', farmer_id: id(4), buyer_id: null, crop_name: 'Rice', land_name: 'Riverbank Plot', image_url: img(5) },
  { id: id(25), title: 'Chickpea Direct Procurement', description: 'Direct farm-gate procurement with flexible delivery windows.', quantity: 118, price_per_unit: 6200, start_date: '2027-03-28', end_date: '2027-04-12', status: 'COMPLETED', farmer_id: id(5), buyer_id: id(102), crop_name: 'Chickpea', land_name: 'Harvest Ridge', image_url: img(6) },
  { id: id(26), title: 'Fresh Tomato Institutional Supply', description: 'Weekly fresh produce supply for hospitality and institutional buyers.', quantity: 82, price_per_unit: 3100, start_date: '2026-06-25', end_date: '2026-07-25', status: 'OPEN', farmer_id: id(6), buyer_id: null, crop_name: 'Tomato', land_name: 'Mango Grove', image_url: img(7) },
  { id: id(27), title: 'Maize Feedstock Agreement', description: 'Feed-grade maize supply with moisture and quality specifications.', quantity: 164, price_per_unit: 2200, start_date: '2026-10-12', end_date: '2026-10-28', status: 'OPEN', farmer_id: id(7), buyer_id: null, crop_name: 'Maize', land_name: 'Golden Acres', image_url: img(8) },
  { id: id(28), title: 'Mustard Oilseed Procurement', description: 'Seasonal oilseed procurement with a pre-agreed price and pickup plan.', quantity: 74, price_per_unit: 5850, start_date: '2027-03-10', end_date: '2027-03-25', status: 'ACCEPTED', farmer_id: id(8), buyer_id: id(103), crop_name: 'Mustard', land_name: 'Meadow Farm', image_url: img(9) },
]

export const DEMO_LISTINGS = DEMO_LANDS.map((land, index) => ({
  id: id(31 + index),
  land_id: land.id,
  land_name: land.land_name,
  village: land.village,
  district: land.district,
  state: land.state,
  area_acres: land.area_acres,
  listing_type: index % 2 ? 'RENTAL' : 'LEASE',
  rate_per_acre: 18000 + index * 1750,
  min_duration_months: 6,
  max_duration_months: 24,
  description: `Well-maintained agricultural property with ${land.irrigation_type.toLowerCase()} and ${land.soil_type.toLowerCase()} soil. Suitable for seasonal commercial cultivation.`,
  status: index === 5 ? 'CLOSED' : 'OPEN',
  image_url: land.image_url,
}))

export const DEMO_EQUIPMENT = [
  { id: id(41), name: 'Mahindra 575 DI Tractor', category: 'Tractor', description: '45 HP tractor suitable for ploughing, sowing and transport.', condition: 'Excellent', location: 'Bhopal', rental_price_per_day: 2200, is_available: true, image_url: img(1) },
  { id: id(42), name: 'John Deere 5310', category: 'Tractor', description: '55 HP tractor with modern hydraulics for heavy farm operations.', condition: 'Excellent', location: 'Indore', rental_price_per_day: 3200, is_available: true, image_url: img(2) },
  { id: id(43), name: 'Combine Harvester 2026', category: 'Harvester', description: 'High-throughput harvesting machine for wheat and paddy.', condition: 'Good', location: 'Sehore', rental_price_per_day: 8500, is_available: true, image_url: img(3) },
  { id: id(44), name: 'Rotavator 7 ft', category: 'Tillage', description: 'Heavy-duty rotavator for seedbed preparation and residue management.', condition: 'Good', location: 'Vidisha', rental_price_per_day: 1800, is_available: true, image_url: img(4) },
  { id: id(45), name: 'Seed Drill 13 Tyne', category: 'Sowing', description: 'Precision seed drill for uniform sowing and reduced seed waste.', condition: 'Excellent', location: 'Raisen', rental_price_per_day: 1450, is_available: true, image_url: img(5) },
  { id: id(46), name: 'Mini Rice Transplanter', category: 'Planting', description: 'Compact rice transplanter designed for small and medium farms.', condition: 'Good', location: 'Harda', rental_price_per_day: 2800, is_available: true, image_url: img(6) },
  { id: id(47), name: 'Boom Sprayer 600L', category: 'Spraying', description: 'Wide-boom sprayer with adjustable pressure and nozzles.', condition: 'Excellent', location: 'Dewas', rental_price_per_day: 1900, is_available: true, image_url: img(7) },
  { id: id(48), name: 'Solar Water Pump', category: 'Irrigation', description: 'Efficient solar irrigation pump for dependable field watering.', condition: 'Excellent', location: 'Ujjain', rental_price_per_day: 1100, is_available: true, image_url: img(8) },
]

export const DEMO_BIDS = [
  { id: id(51), contract_id: id(21), contract_title: DEMO_CONTRACTS[0].title, offered_quantity: 180, offered_price_per_unit: 2525, message: 'We can arrange pickup within five days of harvest.', status: 'PENDING' },
  { id: id(52), contract_id: id(23), contract_title: DEMO_CONTRACTS[2].title, offered_quantity: 96, offered_price_per_unit: 7200, message: 'Interested in a recurring seasonal arrangement.', status: 'ACCEPTED' },
  { id: id(53), contract_id: id(24), contract_title: DEMO_CONTRACTS[3].title, offered_quantity: 200, offered_price_per_unit: 2300, message: 'Can provide transport from the farm gate.', status: 'PENDING' },
  { id: id(54), contract_id: id(26), contract_title: DEMO_CONTRACTS[5].title, offered_quantity: 75, offered_price_per_unit: 3200, message: 'Weekly collection is available.', status: 'REJECTED' },
  { id: id(55), contract_id: id(27), contract_title: DEMO_CONTRACTS[6].title, offered_quantity: 160, offered_price_per_unit: 2250, message: 'Looking for a six-month supplier relationship.', status: 'ACCEPTED' },
  { id: id(56), contract_id: id(28), contract_title: DEMO_CONTRACTS[7].title, offered_quantity: 70, offered_price_per_unit: 5900, message: 'Ready for direct procurement.', status: 'PENDING' },
]

export const DEMO_NOTIFICATIONS = [
  { id: id(61), type: 'success', title: 'Bid accepted', message: 'Your offer on Mustard Oilseed Procurement was accepted.', created_at: '2026-09-21T08:20:00Z', is_read: false },
  { id: id(62), type: 'info', title: 'New contract opportunity', message: 'A new wheat contract matches your marketplace preferences.', created_at: '2026-09-21T07:45:00Z', is_read: false },
  { id: id(63), type: 'warning', title: 'Harvest date approaching', message: 'Your Wheat crop is entering the final preparation window.', created_at: '2026-09-20T16:10:00Z', is_read: false },
  { id: id(64), type: 'success', title: 'Land listing published', message: 'Green Valley Farm is now visible to buyers.', created_at: '2026-09-20T12:30:00Z', is_read: true },
  { id: id(65), type: 'info', title: 'Equipment request updated', message: 'The provider responded to your tractor request.', created_at: '2026-09-19T14:00:00Z', is_read: true },
  { id: id(66), type: 'success', title: 'Profile completed', message: 'Your buyer profile is ready for marketplace activity.', created_at: '2026-09-18T11:20:00Z', is_read: true },
  { id: id(67), type: 'warning', title: 'Support ticket awaiting reply', message: 'Ticket #SUP-2048 is still in progress.', created_at: '2026-09-18T09:15:00Z', is_read: true },
  { id: id(68), type: 'info', title: 'Market update', message: 'Regional wheat prices have been updated in the marketplace.', created_at: '2026-09-17T18:00:00Z', is_read: true },
]

export const DEMO_TICKETS = [
  { id: id(71), subject: 'Unable to update land details', category: 'Account', priority: 'HIGH', status: 'IN_PROGRESS', description: 'The land form saves but the latest irrigation value does not appear immediately.', created_at: '2026-09-21T08:00:00Z', admin_response: 'We are checking the synchronization issue.' },
  { id: id(72), subject: 'Question about contract bids', category: 'Contracts', priority: 'MEDIUM', status: 'OPEN', description: 'How can I compare two bids before accepting one?', created_at: '2026-09-20T13:20:00Z', admin_response: '' },
  { id: id(73), subject: 'Equipment rental request', category: 'Equipment', priority: 'LOW', status: 'RESOLVED', description: 'Need help understanding rental availability dates.', created_at: '2026-09-19T10:10:00Z', admin_response: 'Availability is shown by the provider for each listing.' },
  { id: id(74), subject: 'Profile verification', category: 'Profile', priority: 'MEDIUM', status: 'OPEN', description: 'Please confirm which details are visible to marketplace partners.', created_at: '2026-09-18T16:30:00Z', admin_response: '' },
  { id: id(75), subject: 'Notification preferences', category: 'Notifications', priority: 'LOW', status: 'RESOLVED', description: 'I received an old notification twice.', created_at: '2026-09-17T12:10:00Z', admin_response: 'The duplicate notification has been cleared.' },
  { id: id(76), subject: 'Lease request clarification', category: 'Land Leasing', priority: 'HIGH', status: 'IN_PROGRESS', description: 'Need clarification about minimum lease duration.', created_at: '2026-09-16T09:00:00Z', admin_response: 'Our team is reviewing the listing terms.' },
]

export const DEMO_USERS = [
  { id: id(81), email: 'amit.buyer@example.com', is_active: true, roles: ['buyer'] },
  { id: id(82), email: 'rajesh.farms@example.com', is_active: true, roles: ['farmer'] },
  { id: id(83), email: 'mehta.agro@example.com', is_active: true, roles: ['buyer'] },
  { id: id(84), email: 'greenvalley@example.com', is_active: true, roles: ['farmer'] },
  { id: id(85), email: 'support.agent@example.com', is_active: true, roles: ['admin'] },
  { id: id(86), email: 'tractorhub@example.com', is_active: true, roles: ['equipment_provider'] },
  { id: id(87), email: 'sunrise.farms@example.com', is_active: false, roles: ['farmer'] },
  { id: id(88), email: 'central.agro@example.com', is_active: true, roles: ['buyer', 'equipment_provider'] },
]

export const DEMO_STATS = {
  farmer: { lands: 8, area: 290.55, crops: 8, contracts: 8, activeContracts: 5, pendingBids: 12 },
  buyer: { opportunities: 24, bids: 6, accepted: 2, leaseListings: 8, equipment: 8, saved: 11 },
}

// Presentation helper: keep a page visually rich when a development account has
// only a few real records. Demo rows are marked and must remain read-only.
export function fillPreviewData(liveRows, demoRows, minimum = 6) {
  const live = Array.isArray(liveRows) ? liveRows : []
  if (live.length >= minimum) return { rows: live, hasDemo: false }

  const ids = new Set(live.map(row => row?.id))
  const extras = (demoRows || [])
    .filter(row => !ids.has(row?.id))
    .slice(0, Math.max(0, minimum - live.length))
    .map(row => ({ ...row, __demo: true }))

  return { rows: [...live, ...extras], hasDemo: extras.length > 0 }
}
