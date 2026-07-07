import fs from "fs";
import path from "path";

const testDataDir = path.join(__dirname, "../test-data");
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

// 1. Clean Real Estate CSV
const cleanCsv = `"Created At","Prospect Name","Email Address","Phone Number","Company","City","State","Country","Lead Owner","Status","Project Name","Possession Timeline","Details"
"2026-07-01 10:00:00","Rahul Sharma","rahul.sharma@gmail.com","+91 98765 43210","Sharma Estates","Mumbai","Maharashtra","India","Aryan","GOOD_LEAD_FOLLOW_UP","meridian_tower","3 months","Interested in 3BHK on 15th floor"
"2026-07-02 11:30:00","Aditi Rao","aditi.rao@yahoo.com","+919123456789","Rao Tech","Bangalore","Karnataka","India","Aryan","SALE_DONE","eden_park","Immediate","Done payment for flat 302"
"2026-07-03 14:15:00","Vikram Malhotra","vikram.m@outlook.com","9876543211","Self-Employed","Pune","Maharashtra","India","Support","DID_NOT_CONNECT","varah_swamy","Ready to Move","Not answering calls"
"2026-07-04 16:45:00","Sneha Patel","sneha.patel@gmail.com","+91 88888 88888","Patel & Co","Ahmedabad","Gujarat","India","Aryan","BAD_LEAD","sarjapur_plots","Dec 2026","Irrelevant lead, wrong number"
`;

// 2. Messy Real Estate CRM Export (Combined fields, inconsistent formats, bad enums)
const messyCsv = `"Lead Date","Client Name","Emails","Mobiles","Organization","Location","Owner","Stage","Source Property","Possession","Notes"
"05/12/2026","Rajesh Kumar","rajesh.k@gmail.com, rajesh.work@company.com","+91 99999 11111 / 9999922222","Kumar Industries","Mumbai, MH","Sales Rep 1","Follow Up Needed","Meridian Tower Luxury Flats","2 years","Wants a lake facing view. Also sent secondary email."
"2026-06-30T12:00:00Z","Priya Sen","priya.sen@outlook.com","9876543210","","Kolkata","Aryan","Won","Eden Park Phase 2","Immediate","Lead converted, closed deal."
"25-07-2026","Amit Singh","amit.singh@yahoo.com","+91-87654-32109","Singh Consultants","Noida","Support","Ringing","Varah Swamy Plots","Next Year","Tried twice, no response."
"1719876543000","Neha Gupta","neha.g@gmail.com","+91 98989 89898","Gupta Retail","Delhi","Aryan","junk","Sarjapur Plots","Under Construction","Spam lead, invalid details."
`;

// 3. Skipped Leads CSV (Valid and invalid mixes to test skip conditions)
const skippedCsv = `"Created Date","Name","Email","Phone","Status"
"2026-07-01","Valid Lead 1","valid1@gmail.com","","GOOD_LEAD_FOLLOW_UP"
"2026-07-02","Valid Lead 2","","9876543210","DID_NOT_CONNECT"
"2026-07-03","Invalid Lead (No Contacts)","","","BAD_LEAD"
"2026-07-04","Spam Account","","",""
`;

// 4. Large CSV file to test batching
let largeCsv = `"Created At","Prospect Name","Email Address","Phone Number","Company","City","State","Country","Lead Owner","Status","Project Name","Possession Timeline","Details"\n`;
for (let i = 1; i <= 60; i++) {
  const statuses = ["GOOD_LEAD_FOLLOW_UP", "DID_NOT_CONNECT", "BAD_LEAD", "SALE_DONE"];
  const projects = ["leads_on_demand", "meridian_tower", "eden_park", "varah_swamy", "sarjapur_plots"];
  
  const status = statuses[i % statuses.length];
  const project = projects[i % projects.length];
  
  largeCsv += `"2026-07-01 12:00:${i.toString().padStart(2, '0')}","Test Lead ${i}","test.${i}@gmail.com","+9198765432${i.toString().padStart(2, '0')}","Company ${i}","City ${i}","State ${i}","Country ${i}","Owner ${i}","${status}","${project}","Timeline ${i}","Details for test lead ${i}"\n`;
}

// Write files to disk
fs.writeFileSync(path.join(testDataDir, "clean_real_estate.csv"), cleanCsv);
fs.writeFileSync(path.join(testDataDir, "messy_leads.csv"), messyCsv);
fs.writeFileSync(path.join(testDataDir, "skipped_leads.csv"), skippedCsv);
fs.writeFileSync(path.join(testDataDir, "large_leads.csv"), largeCsv);

console.log("✅ Mock test CSV files written to backend/test-data/");
