export const BASE_URL = 'https://admin.elinacorporation.in/api-1.1/';
// export const BASE_URL = 'https://easyreppo.in/admin/api-1.1/';


export const ENDPOINTS = {
  LOGIN: `${BASE_URL}login.php`,
  List_Staff: `${BASE_URL}list_staff.php`,
  Add_Staff: `${BASE_URL}add_staff.php`,
  Staff_Schedule_List: `${BASE_URL}list_schedule.php`,
  Add_Schedule: `${BASE_URL}add_schedule.php`,
  Search_History: `${BASE_URL}search_history.php`,
  Delete_Staff: `${BASE_URL}delete_staff.php`,
  Update_Staff: `${BASE_URL}update_staff.php`,
  Delete_Schedule: `${BASE_URL}delete_schedule.php`,
  Update_Schedule: `${BASE_URL}update_schedule.php`,
  Intimation_Vehicle: `${BASE_URL}intimation_vehicle.php`,
  Add_Intimation: `${BASE_URL}add_intimation.php`,
  Search_Schedule: `${BASE_URL}search_schedule.php`,
  Area_list: `${BASE_URL}area_list.php`,
  Add_Area: `${BASE_URL}add_area.php`,
  Intimation_List: `${BASE_URL}intimation_list.php`,
  Delete_Area: `${BASE_URL}delete_area.php`,
  Update_Area: `${BASE_URL}update_area.php`,
  Mail_Send_Pdf: `${BASE_URL}mail_send_pdf.php`,
  UserWiseExpiry: `${BASE_URL}user_wise_expiry.php`,
  FullVehicleDetails: `${BASE_URL}full_vehicle_detail_list.php`,
  List_Staff_Profile: `${BASE_URL}list_staff_profile.php`,
  update_profile_img: `${BASE_URL}update_profile_img.php`,
  dummy_data: `${BASE_URL}dummy_data.php`,
  store_vehicle_scan_data: `${BASE_URL}store_vehicle_scan_data.php`,
  store_full_vehicle_scan_data: `${BASE_URL}store_full_vehicle_scan_data.php`,
  VehicleList_Normal: `${BASE_URL}vehicle_list.php`,
  VehicleList_Full: `${BASE_URL}full_vehicle_detail_list.php`,
  delete_vehicle_list: `${BASE_URL}delete_vehicle_list.php`,
  staff: `${BASE_URL}staff.php`,
  otp_verify: `${BASE_URL}otp_verify.php`,
  otp_resend: `${BASE_URL}otp_resend.php`,
  app_setting_time: `${BASE_URL}app_setting_time.php`,
  search_history_paginate: `${BASE_URL}search_history_paginate.php`,
  search_history_search: `${BASE_URL}search_history_search.php`,
  AgencyDetail: `${BASE_URL}agency_detail.php`,
  update_sync_status: `${BASE_URL}update_sync_status.php`,








  ICard: (userId, type) => `${BASE_URL}icard.php?user_id=${userId}&type=${type}`,
};