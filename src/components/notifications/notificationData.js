export const notificationTabs = [
  {
    label: "សេចក្តីជូនដំណឹងអំពីកម្មវិធី",
    href: "/notification/systemnotification",
    type: "system",
  },
  {
    label: "សេចក្តីជូនដំណឹងអំពីរបាយការណ៍",
    href: "/notification/reportnotification",
    type: "report",
  },
  {
    label: "សេចក្តីជូនដំណឹងអំពីសមាជិក",
    href: "/notification/eventnotification",
    type: "event",
  },
];

const descriptions = {
  system:
    "កម្មវិធី សម្របសម្រួលការងារ ប្រជុំបន្ទាន់ និងការជូនដំណឹងពាក់ព័ន្ធនឹង សមាជិកទាំងអស់ដែលត្រូវចូលរួម និងពិនិត្យព័ត៌មានថ្មីៗ។",
  report:
    "របាយការណ៍ ហិរញ្ញវត្ថុ និងការប្រមូលទិន្នន័យត្រូវបានបញ្ចូលសម្រាប់ពិនិត្យ សូមពិនិត្យព័ត៌មាន និងបំពេញការងារដែលនៅសល់។",
  event:
    "សមាជិកថ្មី ការចុះឈ្មោះ និងព័ត៌មានសមាជិកត្រូវបានធ្វើបច្ចុប្បន្នភាព សូមពិនិត្យ និងបញ្ជាក់ព័ត៌មានដែលបានផ្លាស់ប្តូរ។",
};

const titles = {
  system: "សេចក្តីជូនដំណឹងអំពីកម្មវិធី",
  report: "សេចក្តីជូនដំណឹងអំពីរបាយការណ៍",
  event: "សេចក្តីជូនដំណឹងអំពីសមាជិក",
};

const badgeLabels = {
  system: "កម្មវិធី",
  report: "របាយការណ៍",
  event: "ប្រវត្តិ",
};

const dates = [
  "០៤ មិថុនា",
  "៣០ កក្កដា",
  "០១ មិថុនា",
  "០១ មិថុនា",
  "០២ មិថុនា",
  "០៣ សីហា",
  "០២ សីហា",
  "០១ មិថុនា",
  "០២ មិថុនា",
  "០១ មិថុនា",
];

export function getNotifications(type) {
  return Array.from({ length: 10 }, (_, index) => ({
    id: `${type}-${index + 1}`,
    title: titles[type],
    description: descriptions[type],
    badge: badgeLabels[type],
    variant: type,
    date: dates[index],
    read: index % 3 === 2,
  }));
}
