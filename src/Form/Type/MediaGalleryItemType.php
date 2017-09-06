<?php

namespace VideInfra\CMSBundle\Form\Type;

use A2lix\TranslationFormBundle\Form\Type\TranslationsType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\CallbackTransformer;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use VideInfra\CMSBundle\Model\MediaGalleryItem;
use VideInfra\CMSBundle\Model\MediaGalleryItemTranslation;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaGalleryItemType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $locales = $options['locales'];

        $builder
            ->add('galleryorder', HiddenType::class)
            ->add('image', MediaImageType::class)
            ->add('translations', TranslationsType::class, [
                'locales' => $locales,
                'label' => false,
                'fields' => [
                    'title' => ['label' => 'Caption']
                ]
            ])
            ->addModelTransformer(new CallbackTransformer(
                function($data) use ($locales) {

                    $item = new MediaGalleryItem();
                    $item->setImage($data['image'] ?? null);
                    $item->setGalleryorder($data['galleryorder'] ?? null);

                    foreach ($locales as $locale) {
                        $translation = new MediaGalleryItemTranslation();
                        $translation->setLocale($locale);
                        $translation->setTranslatable($item);

                        if (isset($data['title'][$locale])) {
                            $translation->setTitle($data['title'][$locale]);
                        }

                        $item->addTranslation($translation);
                    }

                    return $item;
                },
                function($item) {

                    $data = [];

                    if ($item instanceof MediaGalleryItem) {

                        $titles = [];

                        /** @var MediaGalleryItemTranslation $translation */
                        foreach ($item->getTranslations() as $translation) {
                            $titles[$translation->getLocale()] = $translation->getTitle();
                        }

                        $data = [
                            'image' => $item->getImage(),
                            'galleryorder' => $item->getGalleryorder(),
                            'title' => $titles
                        ];
                    }

                    return $data;
                }
        ));
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => MediaGalleryItem::class,
            'locales' => ['en']
        ]);
    }
}