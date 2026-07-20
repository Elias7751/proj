import 'package:flutter/material.dart';

class SellinkLogo extends StatefulWidget {
  final double size;
  final bool animate;

  const SellinkLogo({
    Key? key,
    this.size = 100.0,
    this.animate = true,
  }) : super(key: key);

  @override
  State<SellinkLogo> createState() => _SellinkLogoState();
}

class _SellinkLogoState extends State<SellinkLogo> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotationAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );

    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.8, end: 1.1).chain(CurveTween(curve: Curves.easeOut)), weight: 40),
      TweenSequenceItem(tween: Tween(begin: 1.1, end: 1.0).chain(CurveTween(curve: Curves.easeIn)), weight: 60),
    ]).animate(_controller);

    _rotationAnimation = Tween<double>(begin: -0.05, end: 0.05).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOutSine),
    );

    if (widget.animate) {
      _controller.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: widget.animate ? _scaleAnimation.value : 1.0,
          child: Transform.rotate(
            angle: widget.animate ? _rotationAnimation.value : 0.0,
            child: SizedBox(
              width: widget.size,
              height: widget.size,
              child: CustomPaint(
                painter: _SellinkLogoPainter(),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _SellinkLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double w = size.width;
    final double h = size.height;

    // 1. Draw the Shopping Bag Background
    final Paint bagPaint = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF00C6FF), Color(0xFF0072FF)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ).createShader(Rect.fromLTWH(0, h * 0.3, w, h * 0.7))
      ..style = PaintingStyle.fill;

    final Path bagPath = Path()
      ..moveTo(w * 0.15, h * 0.3)
      ..lineTo(w * 0.85, h * 0.3)
      ..lineTo(w * 0.9, h * 0.9)
      ..quadraticBezierTo(w * 0.9, h, w * 0.8, h)
      ..lineTo(w * 0.2, h)
      ..quadraticBezierTo(w * 0.1, h, w * 0.1, h * 0.9)
      ..close();

    canvas.drawPath(bagPath, bagPaint);

    // 2. Draw the Bag Handles
    final Paint handlePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.06
      ..strokeCap = StrokeCap.round;

    final Path handlePath = Path()
      ..moveTo(w * 0.35, h * 0.3)
      ..quadraticBezierTo(w * 0.35, h * 0.05, w * 0.5, h * 0.05)
      ..quadraticBezierTo(w * 0.65, h * 0.05, w * 0.65, h * 0.3);

    canvas.drawPath(handlePath, handlePaint);

    // Draw handle circles
    final Paint circlePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(w * 0.35, h * 0.3), w * 0.04, circlePaint);
    canvas.drawCircle(Offset(w * 0.65, h * 0.3), w * 0.04, circlePaint);

    // 3. Draw the Infinity / Link Symbol (Sellink)
    final Paint linkPaint1 = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF00F2FE), Color(0xFF4FACFE)],
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
      ).createShader(Rect.fromLTWH(w * 0.2, h * 0.45, w * 0.6, h * 0.4))
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.12
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final Paint linkPaint2 = Paint()
      ..shader = const LinearGradient(
        colors: [Color(0xFF43E97B), Color(0xFF38F9D7)],
        begin: Alignment.centerLeft,
        end: Alignment.centerRight,
      ).createShader(Rect.fromLTWH(w * 0.2, h * 0.45, w * 0.6, h * 0.4))
      ..style = PaintingStyle.stroke
      ..strokeWidth = w * 0.12
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // Left loop of infinity
    final Path leftLoop = Path()
      ..moveTo(w * 0.5, h * 0.65)
      ..cubicTo(w * 0.3, h * 0.45, w * 0.1, h * 0.65, w * 0.3, h * 0.85)
      ..cubicTo(w * 0.4, h * 0.95, w * 0.5, h * 0.8, w * 0.5, h * 0.65);
    
    // Right loop of infinity
    final Path rightLoop = Path()
      ..moveTo(w * 0.5, h * 0.65)
      ..cubicTo(w * 0.7, h * 0.85, w * 0.9, h * 0.65, w * 0.7, h * 0.45)
      ..cubicTo(w * 0.6, h * 0.35, w * 0.5, h * 0.5, w * 0.5, h * 0.65);

    canvas.drawPath(leftLoop, linkPaint1);
    canvas.drawPath(rightLoop, linkPaint2);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
