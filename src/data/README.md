# Data structure

Pages import JSON datasets directly. Table-ready JSON files keep display fields
consistent and contain the joined values required by each UI table.

## Shared datasets

- `activityRecords.json`: normalized activity names, dates, branch names, and counts
- `branchRecords.json`: normalized branch naming
- `companyDocuments.json`: institution document table rows
- `memberDocuments.json`: member document table rows
- `donationRecords.json`: donation rows formatted for member donation tables
- `branchMemberRecords.json`: branch table rows derived from canonical members
- `participantRecords.json`: participant rows joined with activities and members
- `participationRecords.json`: participation history joined with activities and members
- `dashboardSummary.json`: dashboard totals calculated from canonical records

`members.json` supplies member and mock authentication records.
`donation/donationData.json` supplies donation table and summary presentation
records. Keep IDs aligned when editing related datasets.
