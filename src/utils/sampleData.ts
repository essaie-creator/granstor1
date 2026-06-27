/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileItem } from '../types';

/**
 * Generates a fresh set of realistic simulated files on "Grandma's Computer".
 * Contains duplicate photos, duplicate recipe texts, heavy temporary system junk,
 * and extremely large, rarely accessed old video files.
 */
export function getSampleFiles(): FileItem[] {
  const yearsAgo = (years: number) => Date.now() - years * 365 * 24 * 60 * 60 * 1000;
  const monthsAgo = (months: number) => Date.now() - months * 30 * 24 * 60 * 60 * 1000;

  return [
    // --- EXACT DUPLICATES: Group 1 (Family Reunion Photo) ---
    {
      id: 'family-reunion-1',
      name: 'Family_Reunion_June_2025.jpg',
      path: 'C:/Users/Grandma/Pictures/Family_Reunion_June_2025.jpg',
      size: 2450122, // 2.45 MB
      type: 'image',
      lastModified: monthsAgo(12),
      contentHash: 'hash_reunion_2025_exact',
      similarHash: '1111000011110000111100001111000000001111000011110000111100001111',
      isSimulated: true,
      previewUrl: 'https://picsum.photos/seed/familyreunion/600/450'
    },
    {
      id: 'family-reunion-2',
      name: 'Family_Reunion_June_2025_copy.jpg',
      path: 'C:/Users/Grandma/Pictures/NewFolder_Copy/Family_Reunion_June_2025_copy.jpg',
      size: 2450122, // 2.45 MB
      type: 'image',
      lastModified: monthsAgo(11),
      contentHash: 'hash_reunion_2025_exact',
      similarHash: '1111000011110000111100001111000000001111000011110000111100001111',
      isSimulated: true,
      previewUrl: 'https://picsum.photos/seed/familyreunion/600/450'
    },

    // --- EXACT DUPLICATES: Group 2 (Famous Apple Pie Recipe TXT) ---
    {
      id: 'apple-pie-1',
      name: 'Famous_Apple_Pie_Recipe.txt',
      path: 'C:/Users/Grandma/Documents/Famous_Apple_Pie_Recipe.txt',
      size: 4096, // 4 KB
      type: 'document',
      lastModified: yearsAgo(2),
      contentHash: 'hash_apple_pie_exact',
      isSimulated: true
    },
    {
      id: 'apple-pie-2',
      name: 'Famous_Apple_Pie_Recipe_Draft.txt',
      path: 'C:/Users/Grandma/Desktop/Famous_Apple_Pie_Recipe_Draft.txt',
      size: 4096, // 4 KB
      type: 'document',
      lastModified: yearsAgo(1.9),
      contentHash: 'hash_apple_pie_exact',
      isSimulated: true
    },

    // --- EXACT DUPLICATES: Group 3 (Receipt for New Hearing Aid PDF) ---
    {
      id: 'hearing-aid-1',
      name: 'Receipt_For_New_Hearing_Aid_2025.pdf',
      path: 'C:/Users/Grandma/Documents/Taxes_2025/Receipt_For_New_Hearing_Aid_2025.pdf',
      size: 1240500, // 1.24 MB
      type: 'document',
      lastModified: monthsAgo(4),
      contentHash: 'hash_hearing_aid_exact',
      isSimulated: true
    },
    {
      id: 'hearing-aid-2',
      name: 'Receipt_For_New_Hearing_Aid_2025(1).pdf',
      path: 'C:/Users/Grandma/Downloads/Receipt_For_New_Hearing_Aid_2025(1).pdf',
      size: 1240500, // 1.24 MB
      type: 'document',
      lastModified: monthsAgo(4),
      contentHash: 'hash_hearing_aid_exact',
      isSimulated: true
    },

    // --- AI SIMILAR IMAGES: Group 4 (Cat on a Sofa - original vs blurry/similar version) ---
    {
      id: 'cat-sofa-1',
      name: 'Fat_Cat_Sleeping_On_Sofa.jpg',
      path: 'C:/Users/Grandma/Pictures/Fat_Cat_Sleeping_On_Sofa.jpg',
      size: 1850000, // 1.85 MB
      type: 'image',
      lastModified: monthsAgo(2),
      contentHash: 'hash_cat_original',
      similarHash: '1100110011001100001100110011001111110000111100001111000011110000',
      isSimulated: true,
      previewUrl: 'https://picsum.photos/seed/fatcat/600/450'
    },
    {
      id: 'cat-sofa-2',
      name: 'Fat_Cat_Sleeping_On_Sofa_Blurry.jpg',
      path: 'C:/Users/Grandma/Pictures/WhatsApp_Photos/Fat_Cat_Sleeping_On_Sofa_Blurry.jpg',
      size: 1420100, // 1.42 MB - different file size, not exact hash, but visually identical/similar
      type: 'image',
      lastModified: monthsAgo(2),
      contentHash: 'hash_cat_blurry_copy',
      similarHash: '1100110011001100001100110011001111110000111100001111000011110011', // 62/64 match -> 96.8% similar
      isSimulated: true,
      previewUrl: 'https://picsum.photos/seed/fatcat/600/450?blur=4'
    },

    // --- AI SIMILAR IMAGES: Group 5 (Grandkids Playing in Pool - original vs slightly cropped) ---
    {
      id: 'grandkids-pool-1',
      name: 'Grandkids_In_Swimming_Pool_Summer.jpg',
      path: 'C:/Users/Grandma/Pictures/Grandkids_In_Swimming_Pool_Summer.jpg',
      size: 3250100, // 3.25 MB
      type: 'image',
      lastModified: monthsAgo(10),
      contentHash: 'hash_grandkids_pool_orig',
      similarHash: '1111111100000000111111110000000011110000111100001111000011110000',
      isSimulated: true,
      previewUrl: 'https://picsum.photos/seed/grandkids/600/450'
    },
    {
      id: 'grandkids-pool-2',
      name: 'Grandkids_In_Swimming_Pool_Summer_Cropped.jpg',
      path: 'C:/Users/Grandma/Pictures/For_Facebook/Grandkids_In_Swimming_Pool_Summer_Cropped.jpg',
      size: 2950400, // 2.95 MB - different size, visually similar
      type: 'image',
      lastModified: monthsAgo(10),
      contentHash: 'hash_grandkids_pool_cropped',
      similarHash: '1111111100000000111111110000000011110000111100001111000011100000', // 63/64 match -> 98.4% similar
      isSimulated: true,
      previewUrl: 'https://picsum.photos/seed/grandkids/590/440'
    },

    // --- JUNK SYSTEM FILES (Safe to delete!) ---
    {
      id: 'junk-ie-temp',
      name: 'internet_explorer_setup_temp.exe',
      path: 'C:/Windows/Temp/internet_explorer_setup_temp.exe',
      size: 15450000, // 15.45 MB
      type: 'junk',
      lastModified: yearsAgo(4),
      contentHash: 'hash_ie_temp_junk',
      isSimulated: true
    },
    {
      id: 'junk-crash-log',
      name: 'windows_error_log_crash_2023.log',
      path: 'C:/Users/Grandma/AppData/Local/Temp/windows_error_log_crash_2023.log',
      size: 6120000, // 6.12 MB
      type: 'junk',
      lastModified: yearsAgo(3),
      contentHash: 'hash_crash_log_junk',
      isSimulated: true
    },
    {
      id: 'junk-toolbar-installer',
      name: 'my_search_bar_toolbar_helper_installer.msi',
      path: 'C:/Users/Grandma/Downloads/my_search_bar_toolbar_helper_installer.msi',
      size: 28400000, // 28.4 MB
      type: 'junk',
      lastModified: yearsAgo(5),
      contentHash: 'hash_toolbar_junk',
      isSimulated: true
    },
    {
      id: 'junk-cookie-cache',
      name: 'temporary_cookie_internet_cache_database.tmp',
      path: 'C:/Users/Grandma/AppData/Local/Temp/temporary_cookie_internet_cache_database.tmp',
      size: 9800000, // 9.8 MB
      type: 'junk',
      lastModified: monthsAgo(24),
      contentHash: 'hash_cookie_cache_junk',
      isSimulated: true
    },

    // --- RARELY USED / HUGE VALUABLE FILES (Not duplicates, but highlighted in cleanup suggestions) ---
    {
      id: 'heavy-video-garden',
      name: 'uncompressed_garden_video_2022.avi',
      path: 'C:/Users/Grandma/Videos/uncompressed_garden_video_2022.avi',
      size: 198000000, // 198 MB!
      type: 'video',
      lastModified: yearsAgo(4),
      contentHash: 'hash_garden_heavy_video',
      isSimulated: true
    },
    {
      id: 'heavy-pdf-crochet',
      name: 'crochet_patterns_entire_collection_backup.pdf',
      path: 'C:/Users/Grandma/Documents/crochet_patterns_entire_collection_backup.pdf',
      size: 92400000, // 92.4 MB!
      type: 'document',
      lastModified: yearsAgo(3),
      contentHash: 'hash_crochet_heavy_pdf',
      isSimulated: true
    },

    // --- OTHER HEALTHY UNIQUE FILES (Should not be suggested for deletion) ---
    {
      id: 'unique-tax-doc',
      name: 'My_Income_Taxes_Filing_2025.pdf',
      path: 'C:/Users/Grandma/Documents/Taxes_2025/My_Income_Taxes_Filing_2025.pdf',
      size: 345000, // 345 KB
      type: 'document',
      lastModified: monthsAgo(2),
      contentHash: 'hash_taxes_unique',
      isSimulated: true
    },
    {
      id: 'unique-scenic-background',
      name: 'Beautiful_Red_Rose_Desktop_Background.jpg',
      path: 'C:/Users/Grandma/Pictures/Beautiful_Red_Rose_Desktop_Background.jpg',
      size: 1120000, // 1.12 MB
      type: 'image',
      lastModified: yearsAgo(1),
      contentHash: 'hash_rose_unique',
      similarHash: '0000111100001111000011110000111100001111000011110000111100001111', // distant hash
      isSimulated: true,
      previewUrl: 'https://picsum.photos/seed/redrose/600/450'
    }
  ];
}
