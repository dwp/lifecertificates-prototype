# Document scanner

Reusable GOV.UK Prototype Kit component for scanning the front or back of a photocard.

The component captures an image from the camera and stores the image as a Base64 JPEG data URI in a hidden input.

This means existing review pages can continue using:

```njk
{% if data.scannedDocumentFront %}
  {{ data.scannedDocumentFront }}
{% endif %}
```
