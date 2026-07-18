import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/product_controller.dart';
import 'dart:io';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';

class AddEditProductScreen extends StatefulWidget {
  const AddEditProductScreen({super.key});

  @override
  State<AddEditProductScreen> createState() => _AddEditProductScreenState();
}

class _AddEditProductScreenState extends State<AddEditProductScreen> {
  final ProductController productController = Get.put(ProductController());

  final TextEditingController nameController = TextEditingController();
  final TextEditingController priceController = TextEditingController();
  final TextEditingController descriptionController = TextEditingController();

  bool isEditMode = false;
  String? productId;
  bool isActive = true;
  File? _selectedImage;
  String? _base64Image;
  List<String> _existingImages = [];
  List<Map<String, dynamic>> _variants = [];

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final XFile? image = await _picker.pickImage(
      source: ImageSource.gallery,
    );

    if (image != null) {
      // قص الصورة
      final CroppedFile? croppedFile = await ImageCropper().cropImage(
        sourcePath: image.path,
        aspectRatioPresets: [
          CropAspectRatioPreset.square,
          CropAspectRatioPreset.ratio3x2,
          CropAspectRatioPreset.original,
          CropAspectRatioPreset.ratio4x3,
          CropAspectRatioPreset.ratio16x9
        ],
        uiSettings: [
          AndroidUiSettings(
            toolbarTitle: 'قص الصورة',
            toolbarColor: const Color(0xFF4F46E5),
            toolbarWidgetColor: Colors.white,
            initAspectRatio: CropAspectRatioPreset.original,
            lockAspectRatio: false,
          ),
          IOSUiSettings(
            title: 'قص الصورة',
          ),
        ],
      );

      if (croppedFile != null) {
        setState(() {
          _selectedImage = File(croppedFile.path);
        });
        final bytes = await _selectedImage!.readAsBytes();
        _base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      }
    }
  }

  @override
  void initState() {
    super.initState();

    // التحقق مما إذا كنا في وضع التعديل
    if (Get.arguments != null && Get.arguments['product'] != null) {
      isEditMode = true;
      final product = Get.arguments['product'];
      productId = product['id'];

      nameController.text = product['name'] ?? '';
      priceController.text = product['price']?.toString() ?? '';
      descriptionController.text = product['description'] ?? '';
      isActive = product['status'] == 'active';
      if (product['images'] != null && product['images'].isNotEmpty) {
        _existingImages = List<String>.from(product['images']);
      }
      if (product['variants'] != null) {
        _variants = List<Map<String, dynamic>>.from(
          (product['variants'] as List).map((v) => {
            'attributeName': v['attributeName'] ?? '',
            'attributeValue': v['attributeValue'] ?? '',
            'additionalPrice': double.tryParse(v['additionalPrice']?.toString() ?? '0') ?? 0.0,
            'stock': int.tryParse(v['stock']?.toString() ?? '999') ?? 999,
          }),
        );
      }
    }
  }

  void _addVariantDialog() {
    final attributeNameController = TextEditingController();
    final attributeValueController = TextEditingController();
    final additionalPriceController = TextEditingController(text: '0');
    final stockController = TextEditingController(text: '999');

    Get.dialog(
      AlertDialog(
        title: Text(
          'إضافة خيار جديد للمنتج',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: attributeNameController,
                decoration: InputDecoration(
                  labelText: 'نوع الخيار (مثال: اللون، المقاس)',
                  labelStyle: GoogleFonts.cairo(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: attributeValueController,
                decoration: InputDecoration(
                  labelText: 'قيمة الخيار (مثال: أحمر، XL)',
                  labelStyle: GoogleFonts.cairo(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: additionalPriceController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'السعر الإضافي (ريال)',
                  labelStyle: GoogleFonts.cairo(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: stockController,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: 'كمية المخزون',
                  labelStyle: GoogleFonts.cairo(),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('إلغاء', style: GoogleFonts.cairo()),
          ),
          ElevatedButton(
            onPressed: () {
              if (attributeNameController.text.isEmpty ||
                  attributeValueController.text.isEmpty) {
                Get.snackbar('تنبيه', 'يرجى ملء نوع وقيمة الخيار');
                return;
              }
              setState(() {
                _variants.add({
                  'attributeName': attributeNameController.text,
                  'attributeValue': attributeValueController.text,
                  'additionalPrice': double.tryParse(additionalPriceController.text) ?? 0.0,
                  'stock': int.tryParse(stockController.text) ?? 999,
                });
              });
              Get.back();
            },
            child: Text('إضافة', style: GoogleFonts.cairo()),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد',
          style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // رفع الصورة
            GestureDetector(
              onTap: _pickImage,
              child: Container(
                height: 150,
                decoration: BoxDecoration(
                  color: Colors.grey[200],
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: Colors.grey[400]!,
                    style: BorderStyle.solid,
                  ),
                  image: _selectedImage != null
                      ? DecorationImage(
                          image: FileImage(_selectedImage!),
                          fit: BoxFit.cover,
                        )
                      : (_existingImages.isNotEmpty
                          ? DecorationImage(
                              image: NetworkImage(_existingImages[0]),
                              fit: BoxFit.cover,
                            )
                          : null),
                ),
                child: _selectedImage == null && _existingImages.isEmpty
                    ? Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.add_a_photo, size: 40, color: Colors.grey[600]),
                          const SizedBox(height: 8),
                          Text(
                            'إضافة صورة للمنتج',
                            style: GoogleFonts.cairo(color: Colors.grey[600]),
                          ),
                        ],
                      )
                    : null,
              ),
            ),
            const SizedBox(height: 24),

            TextFormField(
              controller: nameController,
              decoration: InputDecoration(
                labelText: 'اسم المنتج',
                labelStyle: GoogleFonts.cairo(),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: priceController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'السعر (ريال)',
                labelStyle: GoogleFonts.cairo(),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 16),

            TextFormField(
              controller: descriptionController,
              maxLines: 4,
              decoration: InputDecoration(
                labelText: 'وصف المنتج',
                labelStyle: GoogleFonts.cairo(),
                alignLabelWithHint: true,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 24),

            // قسم الخيارات المتنوعة
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'خيارات المنتج المتنوعة (الألوان، المقاسات...)',
                  style: GoogleFonts.cairo(fontSize: 14, fontWeight: FontWeight.bold),
                ),
                TextButton.icon(
                  onPressed: _addVariantDialog,
                  icon: const Icon(Icons.add),
                  label: Text('إضافة خيار', style: GoogleFonts.cairo()),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (_variants.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    'لا توجد خيارات مضافة للمنتج حالياً',
                    style: GoogleFonts.cairo(color: Colors.grey),
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _variants.length,
                itemBuilder: (context, index) {
                  final variant = _variants[index];
                  return Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: ListTile(
                      title: Text(
                        '${variant['attributeName']}: ${variant['attributeValue']}',
                        style: GoogleFonts.cairo(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        'السعر الإضافي: +${variant['additionalPrice']} ريال | المخزون: ${variant['stock']}',
                        style: GoogleFonts.cairo(fontSize: 12),
                      ),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () {
                          setState(() {
                            _variants.removeAt(index);
                          });
                        },
                      ),
                    ),
                  );
                },
              ),
            const SizedBox(height: 16),

            SwitchListTile(
              title: Text('المنتج نشط ومتاح للبيع', style: GoogleFonts.cairo()),
              value: isActive,
              activeColor: const Color(0xFF4F46E5),
              onChanged: (value) {
                setState(() {
                  isActive = value;
                });
              },
            ),
            const SizedBox(height: 32),

            Obx(
              () => ElevatedButton(
                onPressed: productController.isSaving.value
                    ? null
                    : () {
                        if (nameController.text.isEmpty ||
                            priceController.text.isEmpty) {
                          Get.snackbar('تنبيه', 'يرجى إدخال اسم وسعر المنتج');
                          return;
                        }

                        List<String> imagesToSave = [];
                        if (_base64Image != null) {
                          imagesToSave.add(_base64Image!);
                        } else if (_existingImages.isNotEmpty) {
                          imagesToSave = _existingImages;
                        }

                        final productData = {
                          'name': nameController.text,
                          'price': double.tryParse(priceController.text) ?? 0.0,
                          'description': descriptionController.text,
                          'status': isActive ? 'active' : 'hidden',
                          'images': imagesToSave,
                          'variants': _variants,
                        };

                        if (isEditMode) {
                          productController.updateProduct(
                            productId!,
                            productData,
                          );
                        } else {
                          productController.addProduct(
                            productData,
                            onSuccessClear: () {
                              // تفريغ الحقول لإضافة منتج جديد
                              nameController.clear();
                              priceController.clear();
                              descriptionController.clear();
                              setState(() {
                                _selectedImage = null;
                                _base64Image = null;
                                _existingImages = [];
                                _variants = [];
                                isActive = true;
                              });
                            },
                          );
                        }
                      },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: productController.isSaving.value
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        isEditMode ? 'حفظ التعديلات' : 'إضافة المنتج',
                        style: GoogleFonts.cairo(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
