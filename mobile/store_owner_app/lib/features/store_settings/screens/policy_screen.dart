import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class PolicyScreen extends StatelessWidget {
  final String title;
  final String content;

  const PolicyScreen({
    super.key,
    required this.title,
    required this.content,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          title,
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Text(
          content,
          style: GoogleFonts.cairo(
            fontSize: 16,
            height: 1.8,
            color: Colors.black87,
          ),
        ),
      ),
    );
  }
}
