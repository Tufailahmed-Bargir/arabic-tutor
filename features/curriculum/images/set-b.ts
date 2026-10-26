/** Word id → remote image URL (see images.ts for the allowed hosts). */
export const IMAGES: Record<string, string> = {
  d46w8:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/General_Map_of_Switzerland.jpg/250px-General_Map_of_Switzerland.jpg", // map
  d46w9:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Darwin_%28AU%29%2C_Knuckey_St-Mitchell_St%2C_Traffic_Light_--_2019_--_4328.jpg/250px-Darwin_%28AU%29%2C_Knuckey_St-Mitchell_St%2C_Traffic_Light_--_2019_--_4328.jpg", // traffic light
  d47w1:
    "https://images.pexels.com/photos/627681/pexels-photo-627681.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop", // car
  d47w2:
    "https://images.pexels.com/photos/8536723/pexels-photo-8536723.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop", // bus
  d47w3:
    "https://images.pexels.com/photos/2013660/pexels-photo-2013660.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop", // train
  d47w4:
    "https://images.pexels.com/photos/9861441/pexels-photo-9861441.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop", // airplane
  d47w5:
    "https://images.pexels.com/photos/12919925/pexels-photo-12919925.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop", // taxi
  d47w6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Parked_bicycle_with_graffitied_building_facade_and_doors_in_Amsterdam.jpg/250px-Parked_bicycle_with_graffitied_building_facade_and_doors_in_Amsterdam.jpg", // bicycle
  d47w7:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/011_Shinkansen_train_ticket_from_Kyoto_to_Tokyo.jpg/250px-011_Shinkansen_train_ticket_from_Kyoto_to_Tokyo.jpg", // ticket
  d47w8:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Jesen%C3%ADk_train_station_2025.01.jpg/250px-Jesen%C3%ADk_train_station_2025.01.jpg", // train station
  d48w1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Tadoussac_-_Hotel_%281%29.jpg/250px-Tadoussac_-_Hotel_%281%29.jpg", // hotel
  d48w5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Passports-assorted.jpg/250px-Passports-assorted.jpg", // passport
  d48w6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Belber_Striped_Suitcase.jpg/250px-Belber_Striped_Suitcase.jpg", // suitcase
  d49w3:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Trousers-colourisolated.jpg/250px-Trousers-colourisolated.jpg", // trousers
  d49w5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Shoes_in_a_spanish_shoe_store.jpg/250px-Shoes_in_a_spanish_shoe_store.jpg", // shoes
  d50w5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Lutter_10_Pfg_1920.jpg/250px-Lutter_10_Pfg_1920.jpg", // money
  d50w9:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Websters_Pen_Shop_storefront%2C_Bluewater_Shopping_Centre%2C_Kent%2C_22_October_2013.jpg/250px-Websters_Pen_Shop_storefront%2C_Bluewater_Shopping_Centre%2C_Kent%2C_22_October_2013.jpg", // shop
  d51w2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Oranges_-_whole-halved-segment.jpg/250px-Oranges_-_whole-halved-segment.jpg", // oranges
  d51w3:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Close_up_grapes.jpg/250px-Close_up_grapes.jpg", // grapes
  d51w6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Organic_home-grown_tomatoes_-_unripe_to_ripe.jpg/250px-Organic_home-grown_tomatoes_-_unripe_to_ripe.jpg", // tomatoes
  d51w7:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Solanum_tuberosum_Red_Scarlett20170523_7825.jpg/250px-Solanum_tuberosum_Red_Scarlett20170523_7825.jpg", // potatoes
  d51w8:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Mixed_onions.jpg/250px-Mixed_onions.jpg", // onions
  d51w10:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Red_Apple.jpg/250px-Red_Apple.jpg", // apple
  d52w1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Restaurant_in_Place_D%27Youville%2C_Quebec_City.jpg/250px-Restaurant_in_Place_D%27Youville%2C_Quebec_City.jpg", // restaurant
  d52w2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Kulmbach_Zunftstube_Speisekarte_Jan_2015.JPG/250px-Kulmbach_Zunftstube_Speisekarte_Jan_2015.JPG", // menu
  d52w4:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Petit_d%C3%A9jeuner_fran%C3%A7ais.jpg/250px-Petit_d%C3%A9jeuner_fran%C3%A7ais.jpg", // breakfast
  d53w2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Pharmacy-Suomenlinna-D11.jpg/250px-Pharmacy-Suomenlinna-D11.jpg", // pharmacy
  d53w9:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Krankentransportwagen_in_Passau.JPG/250px-Krankentransportwagen_in_Passau.JPG", // ambulance
  d54w1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Panteion_University%27s_Central_Building.JPG/250px-Panteion_University%27s_Central_Building.JPG", // university
  d54w2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Palamuse_kihelkonnakooli_klassiruum.jpg/250px-Palamuse_kihelkonnakooli_klassiruum.jpg", // classroom
  d55w4:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Staff_meeting_%283%29.jpg/250px-Staff_meeting_%283%29.jpg", // meeting
  d55w8:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/ATX_Computer_cases%2C_back_view.jpg/250px-ATX_Computer_cases%2C_back_view.jpg", // computer
  d57w2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/250px-Felis_catus-cat_on_snow.jpg", // cat
  d57w4:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Horse_December_2014-1.jpg/250px-Horse_December_2014-1.jpg", // horse
  d57w5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/07._Camel_Profile%2C_near_Silverton%2C_NSW%2C_07.07.2007.jpg/250px-07._Camel_Profile%2C_near_Silverton%2C_NSW%2C_07.07.2007.jpg", // camel
  d57w6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg/250px-Cow_%28Fleckvieh_breed%29_Oeschinensee_Slaunger_2009-07-07.jpg", // cow
  d57w7:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Flock_of_sheep.jpg/250px-Flock_of_sheep.jpg", // sheep
  d57w8:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Female_house_sparrow_at_Kodai.jpg/250px-Female_house_sparrow_at_Kodai.jpg", // bird
  d57w9:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Oweston_sting_fish_for_sale_at_Tsukiji_Fishmarket%2C_Tokyo-30.jpg/250px-Oweston_sting_fish_for_sale_at_Tsukiji_Fishmarket%2C_Tokyo-30.jpg", // fish
  d57w10:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/African_Bush_Elephant.jpg/250px-African_Bush_Elephant.jpg", // elephant
  d58w1:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Solar_Orbiter%E2%80%99s_widest_high-res_view_of_the_Sun_ESA508430.jpg/250px-Solar_Orbiter%E2%80%99s_widest_high-res_view_of_the_Sun_ESA508430.jpg", // sun
  d58w2:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/250px-FullMoon2010.jpg", // moon
  d58w3:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Star_trail_in_night_sky.jpg/250px-Star_trail_in_night_sky.jpg", // star
  d58w5:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Sea_caves_Cape_Greco_9.jpg/250px-Sea_caves_Cape_Greco_9.jpg", // sea
  d58w6:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Wilkin_River_close_to_its_confluence_with_Makarora_River%2C_Otago%2C_New_Zealand.jpg/250px-Wilkin_River_close_to_its_confluence_with_Makarora_River%2C_Otago%2C_New_Zealand.jpg", // river
  d58w7:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Everest%2C_Himalayas.jpg/250px-Everest%2C_Himalayas.jpg", // mountain
  d58w9:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Dunes%2C_D%C3%A9sert_du_Thar.jpg/250px-Dunes%2C_D%C3%A9sert_du_Thar.jpg", // desert
};
