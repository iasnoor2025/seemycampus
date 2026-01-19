import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../providers/auth_provider.dart';
import '../services/attendance_service.dart';
import '../services/qr_service.dart';
import '../services/api_service.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  final MobileScannerController _controller = MobileScannerController();
  bool _isScanning = true;
  bool _isProcessing = false;
  String? _lastScannedCode;

  final AttendanceService _attendanceService = AttendanceService();
  final QRService _qrService = QRService();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDetect(BarcodeCapture capture) {
    if (!_isScanning || _isProcessing) return;
    
    final List<Barcode> barcodes = capture.barcodes;
    if (barcodes.isEmpty) return;
    
    final String? code = barcodes.first.rawValue;
    if (code != null && code != _lastScannedCode) {
      _lastScannedCode = code;
      _processQRCode(code);
    }
  }

  Future<void> _processQRCode(String qrCodeData) async {
    if (_isProcessing) return;

    setState(() {
      _isProcessing = true;
      _isScanning = false;
    });

    // Stop camera while processing
    await _controller.stop();

    if (!mounted) return;
    
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final user = authProvider.user;

    if (user == null) {
      _showError('User not authenticated');
      _resumeScanning();
      return;
    }

    try {
      // Validate QR code first (this will also check session)
      bool isValid;
      try {
        isValid = await _qrService.validateQRCode(qrCodeData);
      } catch (e) {
        // Check if session expired during QR validation
        if (e is ApiException && e.requiresReauth) {
          final authProvider = Provider.of<AuthProvider>(context, listen: false);
          await authProvider.logout();
          if (mounted) {
            Navigator.of(context).pushReplacementNamed('/login');
          }
          return;
        }
        rethrow;
      }
      
      if (!isValid) {
        _showError(
          'Invalid or expired QR code.\n\n'
          'Please ensure:\n'
          '• You are scanning today\'s QR code\n'
          '• The QR code is not expired\n'
          '• Your device has internet connection',
        );
        _resumeScanning();
        return;
      }

      // Record attendance
      final result = await _attendanceService.recordAttendance(
        user: user,
        qrCodeData: qrCodeData,
      );

      if (mounted) {
        if (result.success) {
          _showSuccess(result.message, result.type);
          
          // Wait a bit before navigating back
          await Future.delayed(const Duration(seconds: 2));
          
          // Navigate back to home screen and refresh
          if (mounted) {
            Navigator.of(context).pop(true); // Pass true to indicate successful scan
          }
        } else {
          // Check if session expired
          if (result.message.contains('Session expired') || 
              result.message.contains('login again')) {
            // Force logout and redirect to login
            final authProvider = Provider.of<AuthProvider>(context, listen: false);
            await authProvider.logout();
            if (mounted) {
              Navigator.of(context).pushReplacementNamed('/login');
            }
            return;
          }
          _showError(result.message);
          _resumeScanning();
        }
      }
    } catch (e) {
      // Check if it's a session expiration error
      if (e.toString().contains('Session expired') || 
          e.toString().contains('requiresReauth')) {
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await authProvider.logout();
        if (mounted) {
          Navigator.of(context).pushReplacementNamed('/login');
        }
        return;
      }
      _showError('Error processing QR code: ${e.toString()}');
      _resumeScanning();
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  void _resumeScanning() {
    setState(() {
      _isScanning = true;
      _lastScannedCode = null;
    });
    _controller.start();
  }

  void _showSuccess(String message, String type) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showError(String message) {
    if (!mounted) return;
    
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 5),
        action: SnackBarAction(
          label: 'OK',
          textColor: Colors.white,
          onPressed: () {},
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFE0E5EC), // Light Neumorphism background
      appBar: AppBar(
        backgroundColor: const Color(0xFFE0E5EC),
        elevation: 0,
        title: const Text(
          'Scan QR Code',
          style: TextStyle(color: Color(0xFF2C3E50)),
        ),
      ),
      body: Stack(
        children: [
          // QR Scanner View
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),

          // Custom overlay with scanning frame
          Positioned.fill(
            child: CustomPaint(
              painter: QRScannerOverlayPainter(),
            ),
          ),

          // Processing overlay
          if (_isProcessing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                    SizedBox(height: 16),
                    Text(
                      'Processing...',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),

          // Instructions
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(20),
                  topRight: Radius.circular(20),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Position QR code within the frame',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'First scan = Check-In\nSubsequent scans = Check-Out',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (!_isScanning)
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.white.withOpacity(0.05),
                            offset: const Offset(-4, -4),
                            blurRadius: 8,
                          ),
                          BoxShadow(
                            color: Colors.black.withOpacity(0.5),
                            offset: const Offset(4, 4),
                            blurRadius: 8,
                          ),
                          BoxShadow(
                            color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                            blurRadius: 15,
                            offset: const Offset(0, 0),
                          ),
                        ],
                      ),
                      child: ElevatedButton(
                        onPressed: _resumeScanning,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).colorScheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                              color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                              width: 1.5,
                            ),
                          ),
                          elevation: 0,
                        ),
                        child: const Text('Scan Again'),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Custom painter for QR scanner overlay
class QRScannerOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black54
      ..style = PaintingStyle.fill;

    final path = Path()
      ..addRect(Rect.fromLTWH(0, 0, size.width, size.height));

    final cutOutSize = 250.0;
    final left = (size.width - cutOutSize) / 2;
    final top = (size.height - cutOutSize) / 2 - 50;

    final cutOutPath = Path()
      ..addRRect(
        RRect.fromRectAndRadius(
          Rect.fromLTWH(left, top, cutOutSize, cutOutSize),
          const Radius.circular(10),
        ),
      );

    final borderPaint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4;

    // Draw semi-transparent overlay
    canvas.drawPath(
      Path.combine(PathOperation.difference, path, cutOutPath),
      paint,
    );

    // Draw border
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(left, top, cutOutSize, cutOutSize),
        const Radius.circular(10),
      ),
      borderPaint,
    );

    // Draw corner brackets
    final bracketLength = 30.0;
    final bracketWidth = 4.0;
    final bracketPaint = Paint()
      ..color = Colors.blue
      ..style = PaintingStyle.stroke
      ..strokeWidth = bracketWidth;

    // Top-left corner
    canvas.drawLine(
      Offset(left, top + bracketLength),
      Offset(left, top),
      bracketPaint,
    );
    canvas.drawLine(
      Offset(left, top),
      Offset(left + bracketLength, top),
      bracketPaint,
    );

    // Top-right corner
    canvas.drawLine(
      Offset(left + cutOutSize - bracketLength, top),
      Offset(left + cutOutSize, top),
      bracketPaint,
    );
    canvas.drawLine(
      Offset(left + cutOutSize, top),
      Offset(left + cutOutSize, top + bracketLength),
      bracketPaint,
    );

    // Bottom-left corner
    canvas.drawLine(
      Offset(left, top + cutOutSize - bracketLength),
      Offset(left, top + cutOutSize),
      bracketPaint,
    );
    canvas.drawLine(
      Offset(left, top + cutOutSize),
      Offset(left + bracketLength, top + cutOutSize),
      bracketPaint,
    );

    // Bottom-right corner
    canvas.drawLine(
      Offset(left + cutOutSize - bracketLength, top + cutOutSize),
      Offset(left + cutOutSize, top + cutOutSize),
      bracketPaint,
    );
    canvas.drawLine(
      Offset(left + cutOutSize, top + cutOutSize - bracketLength),
      Offset(left + cutOutSize, top + cutOutSize),
      bracketPaint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
