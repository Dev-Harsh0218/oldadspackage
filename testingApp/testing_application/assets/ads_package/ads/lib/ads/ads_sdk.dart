import 'dart:convert';
import 'package:ads_sdk_application/ads/AdBanner.dart';
import 'package:ads_sdk_application/ads/AdsbannerBottom.dart';
import 'package:ads_sdk_application/ads/alert_dialogue_modal.dart';
import 'package:ads_sdk_application/ads/alert_dialogue_modal_with_timer.dart';
import 'package:ads_sdk_application/ads/banner_mode_ads.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class AdsSdk {
  static bool _isInitialized = false;
  static String serverUrl = '';
  static String apkUniqueKey = '';

  // Initialize the SDK
  static Future<void> initialize(String serverurl, String apkUniqueKey) async {
    if (_isInitialized) {
      print('SDK is already initialized');
      return;
    }
    // Set the class variables before calling storeData
    AdsSdk.serverUrl = serverurl;
    AdsSdk.apkUniqueKey = apkUniqueKey;
    print('Initializing Ads SDK...');

    await storeData(apkUniqueKey, serverurl);

    _isInitialized = true;
  }

  // Show modal at start
  static void showModalAtStart(BuildContext context) {
    if (_isInitialized) {
      showDialog(
        context: context,
        useSafeArea: false,
        builder: (BuildContext context) {
          return AlertDialogueModal(
              serverUrl: serverUrl, apkUniqueKey: apkUniqueKey);
        },
      );
    } else {
      print('SDK is not initialized');
    }
  }

  static void showModalTimer(BuildContext context) {
    if (_isInitialized) {
      showDialog(
        context: context,
        useSafeArea: false,
        builder: (BuildContext context) {
          return AlertDialogueModalTimer(
              serverUrl: serverUrl, apkUniqueKey: apkUniqueKey);
        },
      );
    } else {
      print('SDK is not initialized');
    }
  }

  // Show ads banner
  static Widget showAdsBanner(BuildContext context,String apkUniqueKey, double aspectRatio) {
    if (_isInitialized) {
      return AdsBanner(
        aspectRatio: aspectRatio,
        apkUniqueKey: apkUniqueKey,
        serverUrl: serverUrl,
      );
    } else {
      print('SDK is not initialized');
    }
    return CircularProgressIndicator();
  }

  // Show ads bottom banner
  static Widget showAdsBottomBanner(BuildContext context,String apkUniqueKey, double aspectRatio) {
    if (_isInitialized) {
      return AdsBannerBottom(
        aspectRatio: aspectRatio,
        apkUniqueKey: apkUniqueKey,
        serverUrl: serverUrl,
      );
    } else {
      print('SDK is not initialized');
    }
    return CircularProgressIndicator();
  }

  // Make API key
  static Future<void> makeApiKey(BuildContext context, String username) async {
    if (!_isInitialized) {
      print('SDK is not initialized');
      return;
    }
    try {
      final response = await http.post(
        Uri.parse('http://$serverUrl/api/insertApiKey'),
        body: jsonEncode({'UserName': username}),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final respData = json.decode(response.body);
        print(respData);
      } else {
        print('Failed to make API key: ${response.body}');
      }
    } catch (e) {
      print('Error: $e');
    }
  }

  // Store data
  static Future<void> storeData(String apkUniqueKey, String urlServer) async {
    String url = 'http://$urlServer/addAdsHandleData';

    final response = await http.post(
      Uri.parse(url),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'ApkUniqueKey': apkUniqueKey,
        'AdslistData': ['com.walli.hd.wallpaper2.png'],
      }),
    );

    if (response.statusCode == 200) {
      print('Data inserted successfully');
    } else {
      print('Error inserting data: ${response.body}');
    }
  }

  // Get API key
  static Future<void> getApiKey(String username) async {
    if (!_isInitialized) {
      print('SDK is not initialized');
      return;
    }
    try {
      final response = await http.get(
        Uri.parse('http://$serverUrl/api/getApiKey/$username'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print({"username": username, "Your Api-Key": data['apiKey']});
      } else if (response.statusCode == 404) {
        print('User not found');
      } else {
        print('Error fetching API key: ${response.body}');
      }
    } catch (e) {
      print('Error: $e');
    }
  }

  // Show banner ad
  static Widget showBannerAd(
      BuildContext context, double width, double height, Alignment alignment) {
    if (_isInitialized) {
      return BannerModeAds(
        width: width,
        height: height,
        positioned: alignment,
        serverUrl: serverUrl,
      );
    } else {
      print('SDK is not initialized');
    }
    return CircularProgressIndicator();
  }
}
