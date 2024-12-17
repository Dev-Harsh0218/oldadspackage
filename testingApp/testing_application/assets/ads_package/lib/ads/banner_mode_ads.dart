import 'dart:convert';

import 'package:ads_sdk_application/ads/video_player.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

class BannerModeAds extends StatefulWidget {
  final double width;
  final double height;
  final Alignment positioned;
  final String serverUrl;
  const BannerModeAds(
      {super.key,
      required this.width,
      required this.height,
      required this.positioned,
      required this.serverUrl});

  @override
  State<BannerModeAds> createState() => _BannerModeAdsState();
}

class _BannerModeAdsState extends State<BannerModeAds> {
  String randomImage = '';
  bool isBlack = true;
  Map<String, dynamic> imageData = {};

  @override
  void initState() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);

    super.initState();
  }

  Future<Map<String, dynamic>> fetchingData() async {
    try {
      final response = await http
          .get(Uri.parse('http://${widget.serverUrl}/getRandomAdsImage'));

      if (response.statusCode == 200) {
        final jsonData = response.body;
        final respData = json.decode(jsonData);
        print(respData);
        return respData;
      }
    } catch (e) {
      print(
        e.toString(),
      );
    }
    return {};
  }

  Future<void> incrementClickCount(String imageId) async {
    try {
      await http.post(
        Uri.parse('http://${widget.serverUrl}/incrementClickCount'),
        body: jsonEncode({'imageId': imageId}),
        headers: {'Content-Type': 'application/json'},
      );
    } catch (e) {
      print(e.toString());
    }
  }

  Future<void> dailyClickCount(String imageId) async {
    try {
      await http.post(
        Uri.parse('http://${widget.serverUrl}/incrementDailyClickCount'),
        body: jsonEncode({'imageId': imageId}),
        headers: {'Content-Type': 'application/json'},
      );
    } catch (e) {
      print(e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return WillPopScope(
        onWillPop: () async {
          if (MediaQuery.of(context).viewInsets.bottom > 0) {
            SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
            return false;
          }
          return false;
        },
        child: FutureBuilder(
          future: fetchingData(),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done) {
              String imageData = snapshot.data!['randomImage'];

              String trimmedPath = imageData.replaceAll('.png', '');
              String appUrl = snapshot.data!['appurl'];

              return Stack(
                children: [
                  GestureDetector(
                    onTap: () async {
                      await launchUrl(Uri.parse(appUrl));
                      await dailyClickCount(trimmedPath);
                      await incrementClickCount(trimmedPath);
                    },
                    child: Align(
                      alignment: widget.positioned,
                      child: Container(
                        width: widget.width,
                        height: widget.height,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: imageData.endsWith('mp4')
                            ? VideoApp(
                                videoUrl: imageData, serverUrl: widget.serverUrl,
                              )
                            : Container(
                                decoration: BoxDecoration(
                                  image: DecorationImage(
                                      image: NetworkImage(
                                          'http://${widget.serverUrl}/images/$imageData'),
                                      fit: BoxFit.cover),
                                ),
                              ),
                      ),
                    ),
                  ),
                  SafeArea(
                    child: Align(
                      alignment: Alignment.topRight,
                      child: GestureDetector(
                        onTap: () {
                          SystemChrome.setEnabledSystemUIMode(
                              SystemUiMode.edgeToEdge);
                          setState(() {});
                          Navigator.pop(context);
                        },
                        child: Container(
                          margin: const EdgeInsets.fromLTRB(0, 0, 15, 0),
                          child: Icon(
                            Icons.cancel_outlined,
                            color: snapshot.data!['isBlack'] == 0
                                ? Colors.white
                                : Colors.black,
                            size: 40,
                          ),
                        ),
                      ),
                    ),
                  )
                ],
              );
            }
            return const Center(child: CircularProgressIndicator());
          },
        ));
  }
}
