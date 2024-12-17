import 'dart:async';
import 'dart:convert';

// import 'package:ads_sdk/ads/video_player.dart';
import 'package:ads_sdk_application/ads/video_player.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';

class AlertDialogueModalTimer extends StatefulWidget {
  final String serverUrl;
  final String apkUniqueKey;
  const AlertDialogueModalTimer({super.key, required this.serverUrl, required this.apkUniqueKey});

  @override
  State<AlertDialogueModalTimer> createState() =>
      _AlertDialogueModalTimerState();
}

class _AlertDialogueModalTimerState extends State<AlertDialogueModalTimer> {
  String randomImage = '';
  bool isBlack = true;
  Map<String, dynamic> imageData = {};

  bool _showCancelButton = false;
  int _secondsRemaining = 5;
  Timer? _timer;
  late Future<Map<String, dynamic>> _futureData;

  // Future<Map<String, dynamic>> fetchData(String id) async {
  //   // Simulate a network call
  //   await Future.delayed(Duration(seconds: 2));
  //   return {
  //     'randomImage': 'example.png',
  //     'appurl': 'https://example.com',
  //     'isBlack': 1,
  //   };
  // }

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

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    _futureData = fetchData(widget.apkUniqueKey);
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(Duration(seconds: 1), (timer) {
      if (_secondsRemaining == 0) {
        setState(() {
          _showCancelButton = true;
        });
        _timer?.cancel();
      } else {
        setState(() {
          _secondsRemaining--;
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
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
          future: _futureData,
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
                                        'http://${widget.serverUrl}/images/${imageData}'),
                                    fit: BoxFit.cover),
                              ),
                            ),
                    ),
                  ),
                  SafeArea(
                    child: Align(
                      alignment: Alignment.topRight,
                      child: _showCancelButton
                          ? GestureDetector(
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
                            )
                          : Container(
                              margin: const EdgeInsets.fromLTRB(0, 0, 15, 0),
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  CircularProgressIndicator(
                                    value: 1.0 - (_secondsRemaining / 5),
                                    strokeWidth: 3.0,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                        Colors.black),
                                  ),
                                  Text(
                                    '$_secondsRemaining',
                                    style: TextStyle(
                                        color: Colors.white, fontSize: 20),
                                  ),
                                ],
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
