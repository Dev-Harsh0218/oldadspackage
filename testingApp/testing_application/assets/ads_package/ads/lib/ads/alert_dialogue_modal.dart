import 'dart:convert';

// import 'package:ads_sdk/ads/video_player.dart';

import 'package:ads_sdk_application/ads/video_player.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

class AlertDialogueModal extends StatefulWidget {
  final String serverUrl;
  final String apkUniqueKey;
  const AlertDialogueModal({super.key, required this.serverUrl, required this.apkUniqueKey});

  @override
  State<AlertDialogueModal> createState() => _AlertDialogueModalState();
}

class _AlertDialogueModalState extends State<AlertDialogueModal> {
  String randomImage = '';
  bool isBlack = true;
  Map<String, dynamic> imageData = {};

  @override
  void initState() {
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    
    super.initState();
  }

  Future<Map<String, dynamic>> fetchData(String apkUniqueKey) async {
    String url =
        'http://${widget.serverUrl}/getRandomAdsImage'; // Replace with your server address

    final response = await http.get(
      Uri.parse(url).replace(queryParameters: {'ApkUniqueKey': apkUniqueKey}),
      headers: {
        'Content-Type': 'application/json',
      },
    );

    if (response.statusCode == 200) {
      // randomImage = response.bod
      final jsonData = response.body;
      final respData = json.decode(jsonData);

      return respData;
    } else {
      print('Error fetching data: ${response.body}');
    }
    return {};
  }

  Future<Map<String, dynamic>> fetchingData() async {
    try {
      final response =
          await http.get(Uri.parse('http://${widget.serverUrl}/getRandomImage'));

      if (response.statusCode == 200) {
        final jsonData = response.body;
        final respData = json.decode(jsonData);

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
          future: fetchData(widget.apkUniqueKey),
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.done) {
              String imageData = snapshot.data!['randomImage'];
              String appUrl = snapshot.data!['appurl'];
              print(imageData);
              String trimmedPath = imageData.replaceAll('.png', '');

              return Stack(
                children: [
                  GestureDetector(
                    onTap: () async {
                      await launchUrl(Uri.parse(appUrl));
                      await dailyClickCount(trimmedPath);
                      await incrementClickCount(trimmedPath);
                    },
                    child: Container(
                      width: double.maxFinite,
                      height: double.maxFinite,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: imageData.endsWith('mp4')
                          ? VideoApp(videoUrl: imageData,serverUrl: widget.serverUrl,)
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
