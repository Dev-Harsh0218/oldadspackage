// import 'dart:convert';

import 'package:ads_sdk_application/ads/ApiController.dart';
import 'package:flutter/material.dart';
// import 'package:http/http.dart' as http;

class AdsBanner extends StatefulWidget {
  final double aspectRatio;
  final String apkUniqueKey;
  final String serverUrl;

  const AdsBanner({
    Key? key,
    required this.aspectRatio,
    required this.apkUniqueKey,
    required this.serverUrl,
  }) : super(key: key);

  @override
  _AdsBannerState createState() => _AdsBannerState();
}

class _AdsBannerState extends State<AdsBanner> {
  bool _isVisible = true;
  late Future<Map<String, dynamic>> _futureData;


  @override
  void initState() {
    super.initState();
    _futureData = ApiServices().fetchData(widget.apkUniqueKey,widget.serverUrl);
    super.initState();
  }

  void _hideBanner() {
    setState(() {
      _isVisible = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_isVisible) {
      return SizedBox.shrink();
    }

    return FutureBuilder(
        future: _futureData,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.done) {
            String imageData = snapshot.data!['randomImage'];
            return AspectRatio(
              aspectRatio: widget.aspectRatio,
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8.0),
                    child: Image.network(
                      "http://${widget.serverUrl}/images/${imageData}",
                      fit: BoxFit.cover,
                    ),
                  ),
                  Align(
                    alignment: Alignment.topRight,
                    child: Container(
                      margin: const EdgeInsets.fromLTRB(0, 0, 5, 0),
                      child: GestureDetector(
                        onTap: _hideBanner,
                        child: Icon(
                          Icons.cancel_outlined,
                          color: Colors.white,
                          size: 30,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          }
           return const Center(child: CircularProgressIndicator());
        });
  }
}
