<?php

namespace VideInfra\CMSBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\CallbackTransformer;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaGalleryType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->addModelTransformer(new CallbackTransformer(
                function ($data) {

                    if (!is_string($data)) {
                        $output = $data;
                    }
                    else {
                        $output = json_decode($data, true);
                    }

                    if (!empty($output)) {
                        uasort($output, function ($a, $b) {
                            return $a['galleryorder'] <= $b['galleryorder'] ? -1 : 1;
                        });
                    }

                    return $output;
                },
                function ($data) {

                    if (is_string($data)) {
                        return $data;
                    }

                    return json_encode($data);
                }
            ))
        ;

        $builder->addEventListener(FormEvents::PRE_SET_DATA, function(FormEvent $event) {

            $data = $event->getData();

            if (is_string($data)) {
                $data = json_decode($data, true);
            }

            $event->setData($data);
        }, 40);
    }

    /**
     * @return string
     */
    public function getBlockPrefix()
    {
        return 'media_gallery';
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return CollectionType::class;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults([
            'entry_type' => MediaGalleryItemType::class,
            'entry_options' => [
                'locales' => ['en']
            ],
            'locales' => ['en'],
            'allow_add' => true,
            'allow_delete' => true
        ]);
    }
}