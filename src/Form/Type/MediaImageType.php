<?php

namespace VideInfra\CMSBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\OptionsResolver\OptionsResolver;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class MediaImageType extends AbstractType
{
    /**
     * @return string
     */
    public function getBlockPrefix()
    {
        return 'media_image';
    }

    /**
     * @return string
     */
    public function getParent()
    {
        return HiddenType::class;
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        parent::configureOptions($resolver);

        $resolver->setDefaults([
            'locales' => ['en']
        ]);
    }
}