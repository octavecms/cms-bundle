<?php

namespace VideInfra\CMSBundle\Form;
use A2lix\TranslationFormBundle\Form\Type\TranslationsType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use VideInfra\CMSBundle\Entity\Page;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class SimpleTextType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $isAdmin = $options['is_admin'];

        if ($isAdmin) {
            $builder
                ->add('name', TextType::class);
        }

        $builder
            ->add('title', TextType::class)
            ->add('active', CheckboxType::class, [
                'required' => false
            ])
            ->add('path', TextType::class);

        $builder
            ->add('content', SimpleTextContentType::class, [
                'locales' => $options['locales']
            ])
        ;

        $builder
            ->add('translations', TranslationsType::class, [
                'locales' => $options['locales'],
                'label' => false,
                'fields' => [
                    'metaTitle' => [
                        'field_type' => TextType::class,
                        'required' => false
                    ],
                    'metaKeywords' => [
                        'field_type' => TextareaType::class,
                        'required' => false
                    ],
                    'metaDescription' => [
                        'field_type' => TextareaType::class,
                        'required' => false
                    ]
                ]
            ]);
    }

    /**
     * @param OptionsResolver $resolver
     */
    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults(array(
            'is_admin' => false,
            'data_class' => Page::class,
            'locales' => ['en']
        ));
    }
}