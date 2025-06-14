# Generated migration

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Dataset',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('file', models.FileField(upload_to='datasets/')),
                ('uploaded_at', models.DateTimeField(auto_now_add=True)),
                ('processed', models.BooleanField(default=False)),
                ('total_records', models.IntegerField(default=0)),
            ],
        ),
        migrations.CreateModel(
            name='MLModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('model_type', models.CharField(choices=[('anomaly_detection', 'Anomaly Detection'), ('classification', 'Classification'), ('regression', 'Regression')], max_length=50)),
                ('version', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('model_file', models.FileField(blank=True, null=True, upload_to='models/')),
                ('parameters', models.JSONField(default=dict)),
                ('metrics', models.JSONField(default=dict)),
                ('is_active', models.BooleanField(default=False)),
                ('training_dataset', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='magtrace_api.dataset')),
            ],
        ),
        migrations.CreateModel(
            name='MagnetometerReading',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp_pc', models.CharField(max_length=50)),
                ('b_x', models.FloatField()),
                ('b_y', models.FloatField()),
                ('b_z', models.FloatField()),
                ('lat', models.FloatField()),
                ('lon', models.FloatField()),
                ('altitude', models.FloatField()),
                ('thetax', models.FloatField()),
                ('thetay', models.FloatField()),
                ('thetaz', models.FloatField()),
                ('sensor_id', models.CharField(max_length=255)),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='readings', to='magtrace_api.dataset')),
            ],
            options={
                'ordering': ['timestamp_pc'],
            },
        ),
        migrations.CreateModel(
            name='Label',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_index', models.IntegerField()),
                ('end_index', models.IntegerField()),
                ('label_type', models.CharField(choices=[('anomaly', 'Anomaly'), ('normal', 'Normal'), ('noise', 'Noise'), ('interference', 'Interference')], max_length=20)),
                ('confidence', models.FloatField(default=1.0)),
                ('created_by', models.CharField(default='user', max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('notes', models.TextField(blank=True)),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='labels', to='magtrace_api.dataset')),
            ],
        ),
        migrations.CreateModel(
            name='InferenceResult',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('predictions', models.JSONField()),
                ('confidence_scores', models.JSONField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='inference_results', to='magtrace_api.dataset')),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='magtrace_api.mlmodel')),
            ],
        ),
        migrations.CreateModel(
            name='ActiveLearningSuggestion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_index', models.IntegerField()),
                ('end_index', models.IntegerField()),
                ('suggested_label', models.CharField(max_length=20)),
                ('confidence', models.FloatField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('reviewed', models.BooleanField(default=False)),
                ('dataset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='suggestions', to='magtrace_api.dataset')),
            ],
        ),
    ]