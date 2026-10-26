/** Word id → remote image URL (see images.ts for the allowed hosts). */
export const IMAGES: Record<string, string> = {
  d1w1: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Lion_%28Panthera_leo%29_male_6y.jpg/250px-Lion_%28Panthera_leo%29_male_6y.jpg", // lion
  d1w2: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Residential_2-storey_stone_house%2C_facade%2C_Sverdlova_Street%2C_9.jpg/250px-Residential_2-storey_stone_house%2C_facade%2C_Sverdlova_Street%2C_9.jpg", // house
  d1w3: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Pink_lady_and_cross_section.jpg/250px-Pink_lady_and_cross_section.jpg", // apples
  d1w4: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/A_Friesian_Bull%2C_Llandeilo_Graban_-_geograph.org.uk_-_579885.jpg/250px-A_Friesian_Bull%2C_Llandeilo_Graban_-_geograph.org.uk_-_579885.jpg", // bull
  d2w1: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/07._Camel_Profile%2C_near_Silverton%2C_NSW%2C_07.07.2007.jpg/250px-07._Camel_Profile%2C_near_Silverton%2C_NSW%2C_07.07.2007.jpg", // camel
  d2w2: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Glass_of_Milk_%2833657535532%29.jpg/250px-Glass_of_Milk_%2833657535532%29.jpg", // milk
  d2w3: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Korb_mit_Br%C3%B6tchen.JPG/250px-Korb_mit_Br%C3%B6tchen.JPG", // bread
  d2w4: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Male_and_female_chicken_sitting_together.jpg/250px-Male_and_female_chicken_sitting_together.jpg", // chicken
  d3w1: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Corncobs.jpg/250px-Corncobs.jpg", // corn
  d3w3: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Magnolia_grandiflora_-_flower_1.jpg/250px-Magnolia_grandiflora_-_flower_1.jpg", // flower
  d3w4: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Balantiocheilos_melanopterus_-_Karlsruhe_Zoo_02_%28cropped%29.jpg/250px-Balantiocheilos_melanopterus_-_Karlsruhe_Zoo_02_%28cropped%29.jpg", // fish
  d4w1: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/The_Sun_in_white_light.jpg/250px-The_Sun_in_white_light.jpg", // sun
  d4w3: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Red-eyed_Leaf_Frog_%2849661076226%29.jpg/250px-Red-eyed_Leaf_Frog_%2849661076226%29.jpg", // frog
  d4w4: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Kleiber_Flug.jpg/250px-Kleiber_Flug.jpg", // bird
  d5w1: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Envelope_-_Boonville_Address-000.jpg/250px-Envelope_-_Boonville_Address-000.jpg", // envelope
  d5w3: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Living_room_in_apartment_of_Condom%C3%ADnio_do_Edif%C3%ADcio_Zaher%2C_Le_Blond%2C_Rio_de_Janeiro%2C_Brazil.jpg/250px-Living_room_in_apartment_of_Condom%C3%ADnio_do_Edif%C3%ADcio_Zaher%2C_Le_Blond%2C_Rio_de_Janeiro%2C_Brazil.jpg", // room
  d5w4: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/250px-African_Bush_Elephant.jpg", // elephant
  d6w1: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/250px-FullMoon2010.jpg", // moon
  d6w2: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg/250px-Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg", // book
  d6w3: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/P1030323.JPG/250px-P1030323.JPG", // lemon
  d6w4: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Glass_of_water_on_vintage_sheet.jpg/250px-Glass_of_water_on_vintage_sheet.jpg", // water
  d7w1: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Starry_Sky_%28149342607%29.jpeg/250px-Starry_Sky_%28149342607%29.jpeg", // star
  d7w2: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Crescent_Moon_%28cropped%29.JPG/250px-Crescent_Moon_%28cropped%29.JPG", // crescent
  d7w3: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Red_rose_with_black_background.jpg/250px-Red_rose_with_black_background.jpg", // rose
  d7w4: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Hand%2C_fingers_-_back.jpg/250px-Hand%2C_fingers_-_back.jpg", // hand
  d8w2: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Stack_of_multicolored_books_on_a_table.jpg/250px-Stack_of_multicolored_books_on_a_table.jpg", // books
  d8w3: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg/250px-Gutenberg_Bible%2C_Lenox_Copy%2C_New_York_Public_Library%2C_2009._Pic_01.jpg", // book
  d8w4: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Langley_High_School_main_entrance_McLean_VA_2023-12-22_08-27-31.jpg/250px-Langley_High_School_main_entrance_McLean_VA_2023-12-22_08-27-31.jpg", // school
  d8w6: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Houten_deur_van_een_woonhuis_in_Guarda._20-09-2019._%28actm.%29.jpg/250px-Houten_deur_van_een_woonhuis_in_Guarda._20-09-2019._%28actm.%29.jpg", // door
  d8w8: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Carandache_Ecridor.jpg/250px-Carandache_Ecridor.jpg", // pen
  d15w1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Glass_of_water_on_vintage_sheet.jpg/250px-Glass_of_water_on_vintage_sheet.jpg", // water
  d15w2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Korb_mit_Br%C3%B6tchen.JPG/250px-Korb_mit_Br%C3%B6tchen.JPG", // bread
  d15w3:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Glass_of_Milk_%2833657535532%29.jpg/250px-Glass_of_Milk_%2833657535532%29.jpg", // milk
  d15w4:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Latte_and_dark_coffee.jpg/250px-Latte_and_dark_coffee.jpg", // coffee
  d15w5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Longjing_tea_steeping_in_gaiwan.jpg/250px-Longjing_tea_steeping_in_gaiwan.jpg", // tea
  d15w6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Pink_lady_and_cross_section.jpg/250px-Pink_lady_and_cross_section.jpg", // apples
  d15w7:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Ceramic_bowl_full_of_white_rice.jpg/250px-Ceramic_bowl_full_of_white_rice.jpg", // rice
  d15w8:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/FoodMeat.jpg/250px-FoodMeat.jpg", // meat
  d15w10:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Egg_cartons_with_chicken_eggs_03.jpg/250px-Egg_cartons_with_chicken_eggs_03.jpg", // eggs
  d16w1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Residential_2-storey_stone_house%2C_facade%2C_Sverdlova_Street%2C_9.jpg/250px-Residential_2-storey_stone_house%2C_facade%2C_Sverdlova_Street%2C_9.jpg", // house
  d16w2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Houten_deur_van_een_woonhuis_in_Guarda._20-09-2019._%28actm.%29.jpg/250px-Houten_deur_van_een_woonhuis_in_Guarda._20-09-2019._%28actm.%29.jpg", // door
  d16w3:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Window_on_a_barn_in_F%C3%A4rlev.jpg/250px-Window_on_a_barn_in_F%C3%A4rlev.jpg", // window
  d16w4:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Living_room_in_apartment_of_Condom%C3%ADnio_do_Edif%C3%ADcio_Zaher%2C_Le_Blond%2C_Rio_de_Janeiro%2C_Brazil.jpg/250px-Living_room_in_apartment_of_Condom%C3%ADnio_do_Edif%C3%ADcio_Zaher%2C_Le_Blond%2C_Rio_de_Janeiro%2C_Brazil.jpg", // room
  d16w5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/La_cuisine_%28mus%C3%A9e_dart_nouveau%2C_Riga%29_%287563655820%29.jpg/250px-La_cuisine_%28mus%C3%A9e_dart_nouveau%2C_Riga%29_%287563655820%29.jpg", // kitchen
  d16w6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Dining_table_in_Standen_House_2024-10-08.jpg/250px-Dining_table_in_Standen_House_2024-10-08.jpg", // table
  d16w7:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Set_of_fourteen_side_chairs_MET_DP110780.jpg/250px-Set_of_fourteen_side_chairs_MET_DP110780.jpg", // chair
  d16w8:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Cozy_bedroom_with_a_large_bed_and_simple_decor_in_a_modern_home.jpg/250px-Cozy_bedroom_with_a_large_bed_and_simple_decor_in_a_modern_home.jpg", // bed
  d21w1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Langley_High_School_main_entrance_McLean_VA_2023-12-22_08-27-31.jpg/250px-Langley_High_School_main_entrance_McLean_VA_2023-12-22_08-27-31.jpg", // school
  d21w2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Blue_mosque_Istanbul_exterior_2007_002.jpg/250px-Blue_mosque_Istanbul_exterior_2007_002.jpg", // mosque
  d21w3:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Entrance_to_souk_attarine.jpg/250px-Entrance_to_souk_attarine.jpg", // market
  d21w4:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Hospital-de-Bellvitge.jpg/250px-Hospital-de-Bellvitge.jpg", // hospital
  d21w5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/An_A380_at_Munich_airport%2C_2012.jpg/250px-An_A380_at_Munich_airport%2C_2012.jpg", // airport
  d21w6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Typical_Street_In_The_Royal_Borough_Of_Kensington_And_Chelsea_In_London.jpg/250px-Typical_Street_In_The_Royal_Borough_Of_Kensington_And_Chelsea_In_London.jpg", // street
  d21w7:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg/250px-Tokyo_Shibuya_Scramble_Crossing_2018-10-09.jpg", // city
  d21w8:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/SanDiegoCityCollegeLearningResource_-_bookshelf.jpg/250px-SanDiegoCityCollegeLearningResource_-_bookshelf.jpg", // library
  d22w3:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Human_right_ear_%28cropped%29.jpg/250px-Human_right_ear_%28cropped%29.jpg", // ear
  d22w5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Adult_human_mouth_%28modified%29.jpg/250px-Adult_human_mouth_%28modified%29.jpg", // mouth
  d22w6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Hand%2C_fingers_-_back.jpg/250px-Hand%2C_fingers_-_back.jpg", // hand
  d22w7:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Legs.jpg/250px-Legs.jpg", // leg
  d23w4:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Savault_Chapel_Under_Milky_Way_BLS.jpg/250px-Savault_Chapel_Under_Milky_Way_BLS.jpg", // night
  d23w5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Pendulum_clock_by_Jacob_Kock%2C_antique_furniture_photography%2C_IMG_0931_edit.jpg/250px-Pendulum_clock_by_Jacob_Kock%2C_antique_furniture_photography%2C_IMG_0931_edit.jpg", // clock
  d23w6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Raindrops_on_the_glass.jpg/250px-Raindrops_on_the_glass.jpg", // rain
};
