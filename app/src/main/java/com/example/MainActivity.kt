package com.example

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.ConsoleMessage
import android.webkit.GeolocationPermissions
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {

    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private lateinit var fileChooserLauncher: ActivityResultLauncher<Intent>
    private lateinit var locationPermissionLauncher: ActivityResultLauncher<Array<String>>
    private var pendingGeoCallback: GeolocationPermissions.Callback? = null
    private var pendingGeoOrigin: String? = null
    private var backPressedTime: Long = 0
    private var mainWebView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Register File Chooser for profile and review photo uploads
        fileChooserLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            if (fileUploadCallback == null) return@registerForActivityResult
            val results: Array<Uri>? = if (result.resultCode == Activity.RESULT_OK && result.data != null) {
                val clipData = result.data?.clipData
                if (clipData != null) {
                    val count = clipData.itemCount
                    val uris = Array(count) { i -> clipData.getItemAt(i).uri }
                    uris
                } else {
                    val dataUri = result.data?.data
                    if (dataUri != null) arrayOf(dataUri) else null
                }
            } else null

            fileUploadCallback?.onReceiveValue(results)
            fileUploadCallback = null
        }

        // Register Location Permission Launcher
        locationPermissionLauncher = registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) { permissions ->
            val granted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
                    permissions[Manifest.permission.ACCESS_COARSE_LOCATION] == true
            if (granted) {
                pendingGeoCallback?.invoke(pendingGeoOrigin, true, false)
            } else {
                pendingGeoCallback?.invoke(pendingGeoOrigin, false, false)
                Toast.makeText(this, "Location permission not granted", Toast.LENGTH_SHORT).show()
            }
            pendingGeoCallback = null
            pendingGeoOrigin = null
        }

        // Handle hardware back button
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                val webView = mainWebView
                if (webView != null) {
                    // Check if any modal/sheet is open in HTML
                    val jsCheck = """
                        (function() {
                            const modals = [
                                '#ppReviewModalOverlay.show',
                                '#ppLightbox.show',
                                '#reviewDetailPage.show',
                                '#sdResellStartPage.show',
                                '#sundariAddAddressPage.show',
                                '#sundariPaymentFormPage.show',
                                '#sundariAddressesPage.show',
                                '#sundariPaymentPage.show',
                                '#sundariProfilePage.show',
                                '#sundariOrdersPage.show',
                                '#wishlistPage.show',
                                '#sundariAuthPage.show',
                                '#accountPage.show',
                                '#deliveryLocationModal.show',
                                '#sdCheckout.show',
                                '#productPage.show',
                                '#cartFull.show',
                                '#modal.show'
                            ];
                            for (let i = 0; i < modals.length; i++) {
                                const el = document.querySelector(modals[i]);
                                if (el) {
                                    const sel = modals[i];
                                    if (sel.indexOf('ppReviewModalOverlay') !== -1) closeCustomerReview();
                                    else if (sel.indexOf('ppLightbox') !== -1) closeReviewLightbox();
                                    else if (sel.indexOf('reviewDetailPage') !== -1) closeReviewDetailPage();
                                    else if (sel.indexOf('sdResellStartPage') !== -1) closeResellStartPage();
                                    else if (sel.indexOf('sundariAddAddressPage') !== -1) closeAddAddressForm();
                                    else if (sel.indexOf('sundariPaymentFormPage') !== -1) closePaymentForm();
                                    else if (sel.indexOf('sundariAddressesPage') !== -1) closeAddressesPage();
                                    else if (sel.indexOf('sundariPaymentPage') !== -1) closePaymentMethodsPage();
                                    else if (sel.indexOf('sundariProfilePage') !== -1) closeProfilePage();
                                    else if (sel.indexOf('sundariOrdersPage') !== -1) closeOrdersPage();
                                    else if (sel.indexOf('wishlistPage') !== -1) closeWishlistPage();
                                    else if (sel.indexOf('sundariAuthPage') !== -1) closeAuthPage();
                                    else if (sel.indexOf('accountPage') !== -1) closeAccountPage();
                                    else if (sel.indexOf('deliveryLocationModal') !== -1) closeDeliveryLocation();
                                    else if (sel.indexOf('sdCheckout') !== -1) sdCheckoutBack();
                                    else if (sel.indexOf('productPage') !== -1) closeProductPage();
                                    else if (sel.indexOf('cartFull') !== -1) closeCartFull();
                                    else if (sel.indexOf('modal') !== -1) closeModal();
                                    return true;
                                }
                            }
                            return false;
                        })();
                    """.trimIndent()

                    webView.evaluateJavascript(jsCheck) { result ->
                        val modalClosed = result?.equals("true", ignoreCase = true) == true
                        if (!modalClosed) {
                            if (webView.canGoBack()) {
                                webView.goBack()
                            } else {
                                val currentTime = System.currentTimeMillis()
                                if (currentTime - backPressedTime < 2000) {
                                    finish()
                                } else {
                                    backPressedTime = currentTime
                                    Toast.makeText(this@MainActivity, "Press back again to exit", Toast.LENGTH_SHORT).show()
                                }
                            }
                        }
                    }
                } else {
                    finish()
                }
            }
        })

        setContent {
            MyApplicationTheme {
                Scaffold(
                    modifier = Modifier
                        .fillMaxSize()
                        .testTag("sundari_main_scaffold")
                ) { innerPadding ->
                    SundariAppView(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding),
                        onWebViewReady = { webView ->
                            mainWebView = webView
                        },
                        onOpenFileChooser = { callback ->
                            fileUploadCallback?.onReceiveValue(null)
                            fileUploadCallback = callback
                            val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                                addCategory(Intent.CATEGORY_OPENABLE)
                                type = "image/*"
                                putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                            }
                            try {
                                fileChooserLauncher.launch(Intent.createChooser(intent, "Select Picture"))
                            } catch (e: Exception) {
                                fileUploadCallback?.onReceiveValue(null)
                                fileUploadCallback = null
                                Toast.makeText(this, "Cannot open file picker", Toast.LENGTH_SHORT).show()
                            }
                        },
                        onRequestLocation = { origin, callback ->
                            val fine = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION)
                            val coarse = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION)
                            if (fine == PackageManager.PERMISSION_GRANTED || coarse == PackageManager.PERMISSION_GRANTED) {
                                callback.invoke(origin, true, false)
                            } else {
                                pendingGeoOrigin = origin
                                pendingGeoCallback = callback
                                locationPermissionLauncher.launch(
                                    arrayOf(
                                        Manifest.permission.ACCESS_FINE_LOCATION,
                                        Manifest.permission.ACCESS_COARSE_LOCATION
                                    )
                                )
                            }
                        }
                    )
                }
            }
        }
    }

    override fun onDestroy() {
        mainWebView?.destroy()
        mainWebView = null
        super.onDestroy()
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun SundariAppView(
    modifier: Modifier = Modifier,
    onWebViewReady: (WebView) -> Unit,
    onOpenFileChooser: (ValueCallback<Array<Uri>>) -> Unit,
    onRequestLocation: (String, GeolocationPermissions.Callback) -> Unit
) {
    var isLoading by remember { mutableStateOf(false) }
    var pageProgress by remember { mutableIntStateOf(100) }

    Box(modifier = modifier.testTag("sundari_container")) {
        AndroidView(
            modifier = Modifier.fillMaxSize().testTag("sundari_webview"),
            factory = { context ->
                WebView(context).apply {
                    setBackgroundColor(android.graphics.Color.WHITE)
                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        databaseEnabled = true
                        allowFileAccess = true
                        allowContentAccess = true
                        loadWithOverviewMode = true
                        useWideViewPort = true
                        setSupportZoom(false)
                        builtInZoomControls = false
                        displayZoomControls = false
                        cacheMode = WebSettings.LOAD_DEFAULT
                        setGeolocationEnabled(true)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                            safeBrowsingEnabled = true
                        }
                    }

                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                            super.onPageStarted(view, url, favicon)
                            isLoading = true
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            super.onPageFinished(view, url)
                            isLoading = false
                        }

                        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                            val uri = request?.url ?: return false
                            val scheme = uri.scheme?.lowercase() ?: return false

                            // Handle UPI, PhonePe, and external action links natively
                            if (scheme == "upi" || scheme == "phonepe" || scheme == "tez" || scheme == "paytmmp" || scheme == "tel" || scheme == "mailto") {
                                return try {
                                    val intent = Intent(Intent.ACTION_VIEW, uri)
                                    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                    context.startActivity(intent)
                                    true
                                } catch (e: ActivityNotFoundException) {
                                    Toast.makeText(context, "No app available to handle this request", Toast.LENGTH_SHORT).show()
                                    true
                                }
                            }
                            return false
                        }
                    }

                    webChromeClient = object : WebChromeClient() {
                        override fun onProgressChanged(view: WebView?, newProgress: Int) {
                            super.onProgressChanged(view, newProgress)
                            pageProgress = newProgress
                            if (newProgress >= 100) {
                                isLoading = false
                            }
                        }

                        override fun onShowFileChooser(
                            webView: WebView?,
                            filePathCallback: ValueCallback<Array<Uri>>?,
                            fileChooserParams: FileChooserParams?
                        ): Boolean {
                            if (filePathCallback != null) {
                                onOpenFileChooser(filePathCallback)
                                return true
                            }
                            return false
                        }

                        override fun onGeolocationPermissionsShowPrompt(
                            origin: String?,
                            callback: GeolocationPermissions.Callback?
                        ) {
                            if (origin != null && callback != null) {
                                onRequestLocation(origin, callback)
                            }
                        }

                        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                            if (consoleMessage != null) {
                                android.util.Log.d(
                                    "SUNDARI_WEBVIEW",
                                    "${consoleMessage.message()} -- From line ${consoleMessage.lineNumber()} of ${consoleMessage.sourceId()}"
                                )
                            }
                            return true
                        }
                    }

                    loadUrl("file:///android_asset/index.html")
                    onWebViewReady(this)
                }
            }
        )

        // Sleek top progress indicator that does not block WebView hardware rendering
        if (isLoading && pageProgress < 100) {
            LinearProgressIndicator(
                progress = { pageProgress / 100f },
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.TopCenter),
                color = Color(0xFF9D1558),
                trackColor = Color.Transparent,
            )
        }
    }
}
