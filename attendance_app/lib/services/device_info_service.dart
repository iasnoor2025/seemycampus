import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:package_info_plus/package_info_plus.dart';

class DeviceInfoService {
  static final DeviceInfoService _instance = DeviceInfoService._internal();
  factory DeviceInfoService() => _instance;
  DeviceInfoService._internal();

  final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();
  PackageInfo? _packageInfo;

  /// Initialize and get package info
  Future<void> initialize() async {
    try {
      _packageInfo = await PackageInfo.fromPlatform();
    } catch (e) {
      // Plugin might not be linked yet - this is okay, we'll handle it gracefully
      print('Warning: Could not initialize PackageInfo: $e');
      _packageInfo = null;
    }
  }

  /// Get device information
  Future<Map<String, String?>> getDeviceInfo() async {
    try {
      Map<String, String?> deviceInfo = {
        'platform': Platform.operatingSystem,
        'appVersion': _packageInfo?.version ?? 'Unknown',
      };

      if (Platform.isAndroid) {
        final androidInfo = await _deviceInfo.androidInfo;
        deviceInfo['deviceModel'] = androidInfo.model;
        deviceInfo['deviceId'] = androidInfo.id;
        deviceInfo['osVersion'] = 'Android ${androidInfo.version.release}';
        deviceInfo['manufacturer'] = androidInfo.manufacturer;
      } else if (Platform.isIOS) {
        final iosInfo = await _deviceInfo.iosInfo;
        deviceInfo['deviceModel'] = iosInfo.model;
        deviceInfo['deviceId'] = iosInfo.identifierForVendor;
        deviceInfo['osVersion'] = 'iOS ${iosInfo.systemVersion}';
        deviceInfo['manufacturer'] = 'Apple';
      } else {
        deviceInfo['deviceModel'] = 'Unknown';
        deviceInfo['deviceId'] = 'Unknown';
        deviceInfo['osVersion'] = Platform.operatingSystemVersion;
      }

      return deviceInfo;
    } catch (e) {
      // Return minimal info on error
      return {
        'platform': Platform.operatingSystem,
        'deviceModel': 'Unknown',
        'deviceId': 'Unknown',
        'osVersion': Platform.operatingSystemVersion,
        'appVersion': _packageInfo?.version ?? 'Unknown',
      };
    }
  }
}
