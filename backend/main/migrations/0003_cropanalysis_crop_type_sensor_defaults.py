from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0002_cropanalysis'),
    ]

    operations = [
        # Add crop_type field
        migrations.AddField(
            model_name='cropanalysis',
            name='crop_type',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
        # Add defaults to sensor fields so image-only analyses work
        migrations.AlterField(
            model_name='cropanalysis',
            name='soil_moisture',
            field=models.FloatField(default=0.0, help_text='Soil moisture percentage (0-100)'),
        ),
        migrations.AlterField(
            model_name='cropanalysis',
            name='temperature',
            field=models.FloatField(default=0.0, help_text='Temperature in Celsius'),
        ),
        migrations.AlterField(
            model_name='cropanalysis',
            name='humidity',
            field=models.FloatField(default=0.0, help_text='Humidity percentage (0-100)'),
        ),
        migrations.AlterField(
            model_name='cropanalysis',
            name='leaf_wetness',
            field=models.FloatField(default=0.0, help_text='Leaf wetness (0-1)'),
        ),
        migrations.AlterField(
            model_name='cropanalysis',
            name='ph_level',
            field=models.FloatField(default=0.0, help_text='Soil pH level'),
        ),
        # Add defaults to metadata fields
        migrations.AlterField(
            model_name='cropanalysis',
            name='farm_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
        migrations.AlterField(
            model_name='cropanalysis',
            name='farmer_name',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
